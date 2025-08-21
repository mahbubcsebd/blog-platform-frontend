import Header from '@/components/Header';

const MainLayout = ({ children }) => {
  return (
    <main>
      <Header />
      {children}
    </main>
  );
};

export default MainLayout;
