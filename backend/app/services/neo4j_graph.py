from neo4j import GraphDatabase

from app.config import settings


class Neo4jGraph:
    def __init__(self) -> None:
        self._driver = GraphDatabase.driver(
            settings.neo4j_uri,
            auth=(settings.neo4j_user, settings.neo4j_password),
        )

    def close(self) -> None:
        self._driver.close()

    def query_diseases(self, symptom_ids: list[str]) -> list[dict]:
        if not symptom_ids:
            return []
        query = """
        MATCH (d:Disease)-[r:HAS_SYMPTOM]->(s:Symptom)
        WHERE s.id IN $ids
        WITH d, collect({symptom: s.name, probability: r.probability}) AS symptoms,
             avg(r.probability) AS score
        RETURN d.name AS disease,
               d.urgency_level AS urgency_level,
               d.description AS description,
               symptoms,
               score
        ORDER BY score DESC
        LIMIT 5
        """
        with self._driver.session() as session:
            result = session.run(query, ids=symptom_ids)
            return [dict(record) for record in result]

    def health(self) -> bool:
        try:
            with self._driver.session() as session:
                session.run("RETURN 1")
            return True
        except Exception:
            return False
