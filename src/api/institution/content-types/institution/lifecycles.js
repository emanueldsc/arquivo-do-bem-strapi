// strapi/src/api/institution/content-types/institution/lifecycles.js

function slugify(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-") // tudo que não é letra/número => "-"
    .replace(/^-+|-+$/g, ""); // tira - do começo/fim
}

export default {
  beforeCreate(event) {
    const { data } = event.params;

    // se não veio slug, mas veio name, gera automaticamente
    if (!data.slug && data.name) {
      data.slug = slugify(data.name);
    }
  },

  beforeUpdate(event) {
    const { data } = event.params;

    // se quiser atualizar o slug quando mudar o name:
    if (data.name && !data.slug) {
      data.slug = slugify(data.name);
    }

    // se você NÃO quiser mexer no slug depois de criado,
    // comente o bloco acima.
  },
};
