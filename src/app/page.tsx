"use client";

import { MdOutlineEmail } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";
import { CiLogin } from "react-icons/ci";
import { useEffect, useState } from "react";
import Loader from "./(utils)/loader";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getUser, loginUser } from "./(serverActions)/authenticationActions";
import { AiFillWarning } from "react-icons/ai";
import Footer from "./(utils)/Footer";

const Login = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState(false);

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
      <div
        id="homePageBg"
        className="flex items-center justify-center h-[20vh]"
      >
        <h1 className="text-center uppercase font-bold text-4xl min-[480px]:text-5xl min-[700px]:text-6xl drop-shadow-[2px_2px_#000 drop-shadow-[2px_2px_#fff]">
          <strong id="gradient-text">Task Manager</strong>
        </h1>
      </div>

      <section className="flex justify-center items-center flex-grow">
        <div className="flex-[0_1_614px] relative">
          <h1
            id="gradient-text"
            className="text-center text-3xl font-bold mt-6 uppercase"
          >
            Log in
          </h1>

          <form
            className="p-4"
            action={async (formData) => {
              if (!loginLoading) {
                // Add await in front of the setStates,if not the state will not change, as the code will quickly go the 'loginUser' line
                await setLoginError(false);
                await setLoginLoading(true);

                const loggedIn = await loginUser(formData);

                if (loggedIn.done) {
                  router.push("/dashboard");
                } else {
                  setLoginLoading(false);
                  setLoginError(true);
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
                disabled={loginLoading}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setLoginError(false);
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
                disabled={loginLoading}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setLoginError(false);
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

            {loginError && (
              <p className="flex items-center text-sm text-red-600 font-bold mb-4 mt-[-12px]">
                <AiFillWarning className="text-2xl" />
                User not found. Sign up instead
              </p>
            )}

            <div className="my-6 text-center text-black text-lg">
              <Link
                href="/signup"
                className="underline decoration-blue-600 italic"
              >
                Don&apos;t have an account&#x3f;{" "}
                <span className="font-bold">Sign up</span>
              </Link>
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loginLoading}
                className="flex-[0_1_800px] relative inline-flex items-center justify-center py-3 pl-4 pr-12 overflow-hidden font-semibold transition-all duration-150 ease-in-out rounded-2xl hover:pl-10 hover:pr-6  text-white bg-purple-500  group w-full mb-4 min-[420px]:mb-8 disabled:cursor-not-allowed"
              >
                <span className="absolute bottom-0 left-0 w-full h-1 transition-all duration-150 ease-in-out bg-black group-hover:h-full"></span>
                <span className="relative uppercase flex justify-center w-full text-left transition-colors duration-200 ease-in-out group-hover:text-white">
                  <span className="flex items-center gap-2">
                    {loginLoading ? (
                      <Loader />
                    ) : (
                      <span>
                        <CiLogin className="text-2xl inline" /> Login
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

export default Login;
