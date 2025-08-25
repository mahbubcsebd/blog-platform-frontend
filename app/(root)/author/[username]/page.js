const Author = async ({ params }) => {
  const username = (await params).username;
  return <div>Author: {username}</div>;
};

export default Author;
