import Image from "next/image";
import Link from "next/link";
import ThemeToggler from "./ThemeToggler";

const NavbarLoginReg = () => {
  return (
    <>
      <div className="bg-secondary py-2 px-5 flex justify-between">
        <Link href={"/"} aria-label="Cyber Pharma — Home">
          <Image
            src="/brand/logo-lockup.svg"
            alt="Cyber Pharma"
            width={180}
            height={34}
            priority
          />
        </Link>

        <div className="flex items-center">
          <ThemeToggler />
        </div>
      </div>
      {/* <h1 className="text-center text-5xl mt-12">
        Next.js 14, Shadcn, Tailwind, Supabase & Resend{" "}
        <small>(Email Service)</small>
      </h1>
      <h3 className="text-center text-3xl mt-12 -mb-[8rem]">
        Login/Logout, Registration, Middleware & Email Validation Setup
      </h3> */}
    </>
  );
};

export default NavbarLoginReg;
