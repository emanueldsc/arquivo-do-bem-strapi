function slugify(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-") // tudo que não é letra/número => "-"
    .replace(/^-+|-+$/g, ""); // tira - do começo/fim
}

const lifecycles = {
  beforeCreate(event) {
    const { data } = event.params;

    if (!data.slug && data.name) {
      data.slug = slugify(data.name as string);
    }
  },

  beforeUpdate(event) {
    const { data } = event.params;

    // se quiser atualizar o slug quando o name mudar
    if (data.name && !data.slug) {
      data.slug = slugify(data.name as string);
    }
  },
};

export default lifecycles;
