async function slugGenerator(title, blogId, Model) {
  const existingSlugs = await Model.findAll({ attributes: ['slug'], where: { blogId } });
  let slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  let uniqueSlug = slug;
  let counter = 1;

  while (existingSlugs.some(post => post.slug === uniqueSlug)) {
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }

  return  uniqueSlug;
}

export { slugGenerator };
