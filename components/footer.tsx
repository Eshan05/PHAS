import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";
import { Input } from "./ui/input";

const sections = [
  {
    title: "Product",
    links: [
      { name: "Overview", href: "#" },
      { name: "About", href: "#" },
      { name: "Pricing", href: "#" },
      { name: "Features", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { name: "Help", href: "#" },
      { name: "Glossary", href: "#" },
      { name: "Questions", href: "#" },
      { name: "Privacy", href: "#" },
    ],
  },
];

const Footer7 = () => {
  return (
    <section className="py-32">
      <div className="lg:px-16">
        <header className="flex flex-col items-center justify-between gap-10 text-center lg:flex-row lg:text-left">
          <main className="flex w-full max-w-96 shrink flex-col items-center justify-between gap-6 lg:items-start">
            <article>
              <span className="flex items-center justify-center gap-4 lg:justify-start">
                <img
                  src="https://shadcnblocks.com/images/block/block-1.svg"
                  alt="logo"
                  className="h-11 dark:invert-100"
                />
                <p className="text-3xl font-semibold">CareSphere</p>
              </span>
              <p className="mt-6 text-sm text-muted-foreground px-6 lg:px-1">
                We provide you with the best medical information as per your need whenever you need. All information regarding medicines, conditions, symptoms and treatments are provided with validation and accuracy.
              </p>
            </article>
            <ul className="flex items-center space-x-6 text-muted-foreground">
              <li className="font-medium hover:text-primary">
                <a href="#">
                  <FaInstagram className="size-6" />
                </a>
              </li>
              <li className="font-medium hover:text-primary">
                <a href="#">
                  <FaFacebook className="size-6" />
                </a>
              </li>
              <li className="font-medium hover:text-primary">
                <a href="#">
                  <FaTwitter className="size-6" />
                </a>
              </li>
              <li className="font-medium hover:text-primary">
                <a href="#">
                  <FaLinkedin className="size-6" />
                </a>
              </li>
            </ul>
          </main>
          <aside className="grid grid-cols-2 gap-10 lg:gap-16">
            {sections.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                <h3 className="mb-6 font-bold">{section.title}</h3>
                <ul className="space-y-4 text-sm text-muted-foreground">
                  {section.links.map((link, linkIdx) => (
                    <li
                      key={linkIdx}
                      className="font-medium hover:text-primary"
                    >
                      <a href={link.href}>{link.name}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </aside>
        </header>
        <section className="mt-20 flex flex-col justify-between gap-4 border-t pt-8 text-center text-sm font-medium text-muted-foreground lg:flex-row lg:items-center lg:text-left">
          <p>© 2025 CareSphere. All rights reserved.</p>
          <ul className="flex justify-center gap-3 lg:justify-start">
            <li className="hover:text-primary">
              <a href="#"> Terms and Conditions</a>
            </li>
            <li className="hover:text-primary">
              <a href="#"> Privacy Policy</a>
            </li>
          </ul>
        </section>
      </div>
    </section>
  );
};

export { Footer7 };
