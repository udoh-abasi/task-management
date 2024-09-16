const Footer = () => {
  const date = new Date();

  return (
    <footer
      id="pageFooter"
      className="h-[150px] min-[850px]:text-2xl text-xl font-bold flex justify-center items-center"
    >
      <p className="text-center">&copy;{date.getFullYear()}</p>
    </footer>
  );
};

export default Footer;
