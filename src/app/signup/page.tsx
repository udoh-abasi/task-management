"use client";

import { MdOutlineEmail } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";
import { CiLogin } from "react-icons/ci";
import { useEffect, useState } from "react";
import Loader from "../(utils)/loader";
import Link from "next/link";
import { AiFillWarning } from "react-icons/ai";
import { signUpUser, getUser } from "../(serverActions)/authenticationActions";
import { useRouter } from "next/navigation";
import Footer from "../(utils)/Footer";

const SignUp = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [signUpLoading, setSignUpLoading] = useState(false);
  const [signUpError, setSignUpError] = useState(false);

  useEffect(() => {
    const getData = async () => {
      const user = await getUser();
      if (user?._id) {
        router.push("/dashboard");
      }
    };

    getData();
  }, [router]);

  return (
    <main className="min-h-screen max-w-[1200px] mx-auto flex flex-col">
      <section className="flex justify-center items-center flex-grow ">
        <div className="flex-[0_1_614px] relative">
          <h1
            id="gradient-text"
            className="text-center text-3xl font-bold mt-16 uppercase"
          >
            Sign Up
          </h1>

          <form
            className="p-4"
            action={async (formData) => {
              if (!signUpLoading) {
                setSignUpLoading(true);
                setSignUpError(false);

                const userCreated = await signUpUser(formData);

                if (userCreated.done) {
                  router.push("/dashboard");
                } else {
                  setSignUpLoading(false);
                  setSignUpError(true);
                }
              }
            }}
          >
            <div className="flex flex-col-reverse mb-8 relative mt-8">
              <input
                type="email"
                required
                placeholder=" "
                id="email"
                name="email"
                disabled={signUpLoading}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                className="h-10 rounded-xl ring-1 ring-purple-500 bg-blue-100 p-1 peer disabled:cursor-not-allowed disabled:bg-gray-600 disabled:ring-gray-600 disabled:text-gray-400"
              />

              <label
                htmlFor="email"
                className="cursor-text p-1 absolute peer-placeholder-shown:top-[50%] peer-placeholder-shown:translate-y-[-50%] peer-focus:top-[-90%] peer-focus:translate-y-[0] top-[-90%] transition-all duration-500 ease-linear"
              >
                <span className="flex items-center gap-2 text-base text-gray-400">
                  <MdOutlineEmail className="" />
                  <span>
                    Email&nbsp;<span className="text-red-500">&#42;</span>
                  </span>
                </span>
              </label>
            </div>

            <div className="flex flex-col-reverse mb-8 relative mt-16">
              <input
                type="password"
                required
                placeholder=" "
                id="password"
                name="password"
                disabled={signUpLoading}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                className="h-10 rounded-xl ring-1 ring-purple-500 bg-blue-100 p-1 peer disabled:cursor-not-allowed disabled:bg-gray-600 disabled:ring-gray-600 disabled:text-gray-400"
              />

              <label
                htmlFor="password"
                className="cursor-text p-1 absolute peer-placeholder-shown:top-[50%] peer-placeholder-shown:translate-y-[-50%] peer-focus:top-[-90%] peer-focus:translate-y-[0] top-[-90%] transition-all duration-500 ease-linear"
              >
                <span className="flex items-center gap-2 text-base text-gray-400">
                  <RiLockPasswordLine className="" />
                  <span>
                    Password&nbsp;<span className="text-red-500">&#42;</span>
                  </span>
                </span>
              </label>
            </div>

            <div className="flex flex-col-reverse mb-8 relative mt-16">
              <input
                type="password"
                required
                placeholder=" "
                id="confirmPassword"
                name="confirmPassword"
                disabled={signUpLoading}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                }}
                className="h-10 rounded-xl ring-1 ring-purple-500 bg-blue-100 p-1 peer disabled:cursor-not-allowed disabled:bg-gray-600 disabled:ring-gray-600 disabled:text-gray-400"
              />

              <label
                htmlFor="confirmPassword"
                className="cursor-text p-1 absolute peer-placeholder-shown:top-[50%] peer-placeholder-shown:translate-y-[-50%] peer-focus:top-[-90%] peer-focus:translate-y-[0] top-[-90%] transition-all duration-500 ease-linear"
              >
                <span className="flex items-center gap-2 text-base text-gray-400">
                  <RiLockPasswordLine className="" />
                  <span>
                    Confirm Password&nbsp;
                    <span className="text-red-500">&#42;</span>
                  </span>
                </span>
              </label>
            </div>

            {password !== confirmPassword && (
              <p className="flex items-center text-sm text-red-600 font-bold mb-4 mt-[-12px]">
                <AiFillWarning className="text-2xl" />
                Passwords do NOT match
              </p>
            )}

            {signUpError && (
              <p className="flex items-center text-sm text-red-600 font-bold mb-4 mt-[-12px]">
                <AiFillWarning className="text-2xl" />
                Something went wrong
              </p>
            )}

            <div className="my-6 text-center text-black text-lg">
              <Link
                href="/"
                className="underline decoration-blue-600 decoration-[1.5px]"
              >
                Already have an account&#x3f;{" "}
                <span className="font-bold italic">Log in</span>
              </Link>
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={signUpLoading}
                className="flex-[0_1_800px] relative inline-flex items-center justify-center py-3 pl-4 pr-12 overflow-hidden font-semibold transition-all duration-150 ease-in-out rounded-2xl hover:pl-10 hover:pr-6  text-white bg-purple-500  group w-full mb-4 min-[420px]:mb-8 disabled:cursor-not-allowed"
              >
                <span className="absolute bottom-0 left-0 w-full h-1 transition-all duration-150 ease-in-out bg-black group-hover:h-full"></span>
                <span className="relative uppercase flex justify-center w-full text-left transition-colors duration-200 ease-in-out group-hover:text-white">
                  <span className="flex items-center gap-2">
                    {signUpLoading ? (
                      <Loader />
                    ) : (
                      <span>
                        <CiLogin className="text-2xl inline" /> Sign Up
                      </span>
                    )}
                  </span>
                </span>
              </button>
            </div>
          </form>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default SignUp;
