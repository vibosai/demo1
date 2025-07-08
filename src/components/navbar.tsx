import Link from "next/link";

const links = [
  { title: "Product", url: "#product" },
  { title: "Layers", url: "#layers" },
  { title: "Who It's For", url: "#audience" },
  { title: "Contact", url: "#contact" },
];

export const Navbar = () => {
  return (
    <header className="flex justify-between items-center px-8 py-4 bg-[#0f0f0f]">
      <div className="font-bold text-2xl text-[#00fff7]">vibOS</div>
      <nav className="flex gap-3.5">
        {links.map((link, index) => (
          <Link key={index} href={link.url} className="mx-4 text-[#ccc] font-medium no-underline">
            {link.title}
          </Link>
        ))}
      </nav>
      <button className="bg-[#00fff7] text-[#000] px-3.5 font-medium text-sm py-2 border-none rounded cursor-pointer transition-shadow duration-300 ease-in-out hover:shadow-[0_0_12px_#00fff7]">
        Request Early Access
      </button>
    </header>
  );
};
