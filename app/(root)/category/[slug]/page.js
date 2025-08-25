const Category = async ({ params }) => {
  const slug = (await params).slug;
  return <div>Category: {slug}</div>;
};

export default Category;
