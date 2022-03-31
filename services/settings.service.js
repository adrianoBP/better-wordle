const getAvailableLanguages = () => {
  return [
    {
      code: 'de_de',
      name: 'German',
    },
    {
      code: 'dk_dk',
      name: 'Danish',
    },
    {
      code: 'en_en',
      name: 'English - Global',
    },
    {
      code: 'en_uk',
      name: 'English - UK',
    },
    {
      code: 'en_us',
      name: 'English - US',
    },
    {
      code: 'es_es',
      name: 'Spanish',
    },
    {
      code: 'fr_fr',
      name: 'French',
    },
    {
      code: 'it_it',
      name: 'Italian',
    },
    {
      code: 'nl_nl',
      name: 'Dutch',
    },
    {
      code: 'unix',
      name: 'Unix System',
    },
  ];
};

export default {
  getAvailableLanguages,
};
