/* eslint-disable no-unused-vars */
const DEFAULT_QUESTIONS = {
  'Chief Complaint': [
    {
      id: 'chief_complaint',
      text: 'Chief Complaint',
      type: 'textarea',
      placeholder: 'In one line with duration',
    },
  ],
  'History of Presenting Illness': [
    {
      id: 'hopi_onset',
      text: 'Onset',
      type: 'textarea',
      placeholder: 'Sudden, gradual, etc.',
    },
    {
      id: 'hopi_associated',
      text: 'Associated Symptoms',
      type: 'textarea',
    },
    {
      id: 'hopi_negative',
      text: 'Negative Symptoms',
      type: 'textarea',
    },
    {
      id: 'hopi_time',
      text: 'Time and Duration',
      type: 'textarea',
    },
    {
      id: 'hopi_triggers',
      text: 'Exacerbating Factors, Triggers and Relieving Factors',
      type: 'textarea',
    },
    {
      id: 'hopi_severity',
      text: 'Severity',
      type: 'textarea',
      placeholder: 'On a scale from 0 to 10',
    },
    {
      id: 'hopi_perspective',
      text: "Patient's Perspective",
      type: 'textarea',
      placeholder: 'Ideas, concerns, expectations, etc.',
    },
    {
      id: 'hopi_other',
      text: 'Other History of Presenting Illness',
      type: 'textarea',
    },
  ],
  'Medical History': [
    {
      id: 'mh_illnesses',
      text: 'Chronic Illnesses',
      type: 'yesno',
      followups: [
        {
          id: 'pmh_illnesses_details',
          text: 'Chronic Illness Details',
          placeholder: 'Name of illness, year of diagnosis, follow-up, treatment, etc.',
          multi: true,
        },
      ],
    },
    {
      id: 'mh_medications',
      text: 'Current Medications',
      type: 'yesno',
      followups: [
        {
          id: 'pmh_medications_details',
          text: 'Medication Details',
          placeholder: 'Name of medication, dose, timing, frequency, side effects, compliance, etc.',
          multi: true,
        },
      ],
    },
    {
      id: 'mh_surgeries',
      text: 'Past Surgeries or Procedures',
      type: 'yesno',
      followups: [
        {
          id: 'mh_surgeries_details',
          text: 'Surgery Details',
          placeholder: 'Type of surgery, indications, year of surgery, hospital, etc.',
          multi: true,
        },
      ],
    },
    {
      id: 'mh_allergies',
      text: 'Allergies',
      type: 'yesno',
      followups: [
        {
          id: 'mh_allergies_details',
          text: 'Allergy Details',
          placeholder: 'Allergen, reaction, etc.',
          multi: true,
        },
      ],
    },
    {
      id: 'mh_hospitalisations',
      text: 'Previous Hospitalisations',
      type: 'yesno',
      followups: [
        {
          id: 'mh_hospitalisations_details',
          text: 'Hospitalisation Details',
          placeholder: 'Indication, year of hospitalisation, hospital, etc.',
          multi: true,
        },
      ],
    },
    {
      id: 'omh_other',
      text: 'Other Medical History',
      type: 'textarea',
    },
  ],
  'Family History': [
    {
      id: 'fh_members',
      text: 'Family Members',
      type: 'textarea',
      placeholder: 'Parents, siblings, partner, children, etc.',
    },
    {
      id: 'fh_illnesses',
      text: 'Family Illnesses',
      type: 'yesno',
      followups: [
        {
          id: 'fh_illnesses_details',
          text: 'Family Illness Details',
          placeholder: 'Name of illness, year of diagnosis, year of passing, etc.',
          multi: true,
        },
      ],
    },
    {
      id: 'fh_other',
      text: 'Other Family History',
      type: 'textarea',
    },
  ],
  'Social History': [
    {
      id: 'sh_occupation',
      text: 'Occupation',
      type: 'textarea',
    },
    {
      id: 'sh_living',
      text: 'Living Conditions',
      type: 'textarea',
      placeholder: 'Address, type of house, housemates, etc.',
    },
    {
      id: 'sh_smoking',
      text: 'Smoking',
      type: 'yesno',
      followups: [
        {
          id: 'sh_smoking_amount',
          text: 'Cigarettes per Day',
          type: 'text',
          placeholder: '1 pack contains 20 cigarettes',
        },
        {
          id: 'sh_smoking_year',
          text: 'Duration of Smoking',
          type: 'text',
        },
        {
          id: 'sh_smoking_frequency',
          text: 'Frequency of Smoking',
          type: 'text',
        },
      ],
    },
    {
      id: 'sh_alcohol',
      text: 'Alcohol',
      type: 'yesno',
      followups: [
        {
          id: 'sh_alcohol_units',
          text: 'Units per Week',
          type: 'text',
          placeholder: '1 unit contains 10 ml of pure alcohol',
        },
        {
          id: 'sh_alcohol_year',
          text: 'Duration of Drinking',
          type: 'text',
        },
        {
          id: 'sh_alcohol_frequency',
          text: 'Frequency of Drinking',
          type: 'text',
        },
        {
          id: 'sh_alcohol_type',
          text: 'Type of Alcohol',
          type: 'text',
          placeholder: 'Wine, beer, rum, whisky, cider, vodka, etc.',
        },
      ],
    },
    {
      id: 'sh_recreational',
      text: 'Recreational Drugs',
      type: 'yesno',
      followups: [
        {
          id: 'sh_recreational_details',
          text: 'Recreational Drug Details',
          placeholder: 'Name of drug, duration of abuse, amount, frequency, administration, etc.',
          multi: true,
        },
      ],
    },
    {
      id: 'sh_other',
      text: 'Other Social History',
      type: 'textarea',
    },
  ],
  'Review of Systems': [
    {
      id: 'ros_constitutional',
      text: 'Constitutional Symptoms',
      type: 'textarea',
      placeholder: 'Fever, LOA, LOW, etc.',
    },
    {
      id: 'ros_cardiovascular',
      text: 'Cardiovascular System',
      type: 'textarea',
      placeholder: 'Chest pain, dyspnoea, etc.',
    },
    {
      id: 'ros_respiratory',
      text: 'Respiratory System',
      type: 'textarea',
      placeholder: 'Cough, dyspnoea, etc.',
    },
    {
      id: 'ros_gi',
      text: 'GI System',
      type: 'textarea',
      placeholder: 'Abdominal pain, vomiting, diarrhoea, etc.',
    },
    {
      id: 'ros_nervous',
      text: 'Nervous System',
      type: 'textarea',
      placeholder: 'Altered senses, headaches, etc.',
    },
    {
      id: 'ros_msk',
      text: 'MSK System',
      type: 'textarea',
      placeholder: 'Joint pain, muscle weakness, etc.',
    },
    {
      id: 'ros_urinary',
      text: 'Urinary System',
      type: 'textarea',
      placeholder: 'Dysuria, hesistancy, etc.',
    },
    {
      id: 'ros_other',
      text: 'Other Review of Systems',
      type: 'textarea',
    },
  ],
  'Miscellaneous History': [
    {
      id: 'misc',
      text: 'Miscellaneous History',
      type: 'textarea',
    },
  ],
};
