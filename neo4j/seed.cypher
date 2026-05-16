CREATE CONSTRAINT symptom_id IF NOT EXISTS FOR (s:Symptom) REQUIRE s.id IS UNIQUE;
CREATE CONSTRAINT disease_name IF NOT EXISTS FOR (d:Disease) REQUIRE d.name IS UNIQUE;

MERGE (s1:Symptom {id: "sym_chest_pain", name: "Chest Pain"})
MERGE (s2:Symptom {id: "sym_dyspnea", name: "Shortness of Breath"})
MERGE (s3:Symptom {id: "sym_fever", name: "Fever"})
MERGE (s4:Symptom {id: "sym_headache", name: "Headache"})
MERGE (s5:Symptom {id: "sym_nausea", name: "Nausea"})
MERGE (s6:Symptom {id: "sym_dizziness", name: "Dizziness"})
MERGE (s7:Symptom {id: "sym_abdominal_pain", name: "Abdominal Pain"})
MERGE (s8:Symptom {id: "sym_cough", name: "Cough"});

MERGE (d1:Disease {
  name: "Acute Myocardial Infarction",
  urgency_level: "Level 1 (Emergency)",
  description: "Heart attack — requires immediate emergency care"
})
MERGE (d2:Disease {
  name: "Pulmonary Embolism",
  urgency_level: "Level 1 (Emergency)",
  description: "Blood clot in lungs — life-threatening"
})
MERGE (d3:Disease {
  name: "Influenza",
  urgency_level: "Level 2 (Urgent)",
  description: "Viral infection — may need urgent evaluation"
})
MERGE (d4:Disease {
  name: "Migraine",
  urgency_level: "Level 3 (Self-Care)",
  description: "Often manageable with rest and OTC medication"
})
MERGE (d5:Disease {
  name: "Gastroenteritis",
  urgency_level: "Level 3 (Self-Care)",
  description: "Stomach flu — hydration and rest"
});

MERGE (d1)-[:HAS_SYMPTOM {probability: 0.85}]->(s1)
MERGE (d1)-[:HAS_SYMPTOM {probability: 0.70}]->(s2)
MERGE (d2)-[:HAS_SYMPTOM {probability: 0.75}]->(s2)
MERGE (d2)-[:HAS_SYMPTOM {probability: 0.55}]->(s1)
MERGE (d3)-[:HAS_SYMPTOM {probability: 0.80}]->(s3)
MERGE (d3)-[:HAS_SYMPTOM {probability: 0.45}]->(s2)
MERGE (d4)-[:HAS_SYMPTOM {probability: 0.90}]->(s4)
MERGE (d4)-[:HAS_SYMPTOM {probability: 0.40}]->(s5)
MERGE (d5)-[:HAS_SYMPTOM {probability: 0.85}]->(s7)
MERGE (d5)-[:HAS_SYMPTOM {probability: 0.70}]->(s5);
