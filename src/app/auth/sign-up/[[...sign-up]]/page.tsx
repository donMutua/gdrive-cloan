"use client";

// import { SignUp } from "@clerk/nextjs";
import Image from "next/image";

export default function SignUpPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center px-8">
        <div className="mx-auto flex w-full max-w-md flex-col space-y-8">
          <div className="flex flex-col items-center space-y-3 text-center">
            <div className="rounded-full bg-primary/10 p-3">
              <svg
                className="h-10 w-10 text-primary"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
                />
              </svg>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Create an account</h1>
              <p className="text-muted-foreground">
                Start your journey with CloudVault
              </p>
            </div>
          </div>

          {/* <SignUp
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none p-0",
                header: "hidden",
                footer: "hidden",
                formButtonPrimary:
                  "w-full bg-primary hover:bg-primary/90 text-white py-2 rounded-md",
                formFieldInput:
                  "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6",
                formFieldLabel:
                  "block text-sm font-medium leading-6 text-gray-900 mb-1",
                formResendCodeLink: "text-primary hover:text-primary/80",
                socialButtonsBlockButton:
                  "w-full border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-500 shadow-sm hover:bg-gray-50 rounded-md",
                footerAction: "mt-4 text-center text-sm",
                footerActionLink: "text-primary hover:underline",
              },
              layout: {
                socialButtonsPlacement: "bottom",
              },
            }}
            routing="path"
            path="/auth/sign-up"
            signInUrl="/auth/sign-in"
            fallbackRedirectUrl="/dashboard"
          /> */}
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        <div className="relative h-full w-full">
          <Image
            src="/signup.jpg"
            alt="Cloud storage illustration"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/30">
            <div className="flex h-full flex-col items-start justify-end p-12 text-white">
              <div className="space-y-3">
                <h2 className="text-2xl font-bold">Why CloudVault?</h2>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>Advanced security and encryption</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>Seamless collaboration tools</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>Access from any device, anywhere</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
