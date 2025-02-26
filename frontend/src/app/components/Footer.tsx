import Image from "next/image";

const Footer = () => {
  return (
    <footer className="mt-auto w-full bg-black text-white flex items-center justify-center p-2">
      <p className="flex items-center gap-2 text-sm">
        © {new Date().getFullYear()} 
        <a href="https://www.konarworks.com/" target="_blank" rel="noopener noreferrer">
          <Image src="/kwlogo.png" alt="konarworks" width={25} height={25} />
        </a>
        All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
