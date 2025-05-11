"use client"


import { motion } from "framer-motion"
import { Github, Code2, Braces, GitBranch, Star, MessageSquare, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar"
import Image from "next/image"
import Link from "next/link"

export default function Home() {

  const users = [{
   name: "Angela",
   role: "Frontend Developer",
   avatar: "https://images.unsplash.com/photo-1619895862022-09114b41f16f?q=40&w=400",
   review:
     "Git Forge has been a game-changer for me. As someone new to open source, I can now understand complex codebases without spending hours reading documentation. The commit summaries are incredibly helpful!",
 },
 {
   name: "Michael Rodriguez",
   role: "Computer Science Student",
   avatar: "https://plus.unsplash.com/premium_photo-1664199486587-37f325d15182?q=40&w=400",
   review:
     "I use Git Forge for all my school projects. Being able to ask questions about unfamiliar code has helped me learn faster. The AI explanations are clear and easy to understand, even for complex algorithms.",
 }]

 const demoSection = [
  {
     icon: <GitBranch className="w-10 h-10 text-purple-600 " />,
     title: "Commit Summaries",
     description: "Get AI-generated summaries of the latest commits to quickly understand project changes.",
   },
   {
     icon: <MessageSquare className="w-10 h-10 text-purple-600 " />,
     title: "Ask Any Question",
     description: "Use natural language to ask questions about the codebase and get accurate answers.",
   },
   {
     icon: <Code2 className="w-10 h-10 text-purple-600 " />,
     title: "Code Explanations",
     description: "Complex code explained in simple terms to help beginners understand the project.",
   },
  ]

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-b from-slate-50 to-slate-100  ">

      <header className="fixed top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200  ">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
                <Github className="w-6 h-6 mr-2 text-purple-600 " />
                <span className="text-xl font-bold text-slate-900 ">Git Forge</span>
            </div>
            <div className="flex items-center">
              <Link href={"/sign-in"}>              
              <Button variant="ghost" className="mr-2">
                Sign In
              </Button>
              </Link>
               <Link href={"/sign-up"}>
              <Button className="bg-purple-600 hover:bg-purple-700">
                Sign Up
              </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="w-full max-w-6xl px-4 pt-32 pb-20 mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity:  1, y:  -10 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex justify-center mb-6"
          >
            <div className="relative p-2 bg-white dark:bg-slate-800 rounded-full shadow-lg">
              <Github className="w-12 h-12 text-slate-800 dark:text-white" />
              <motion.div
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  duration: 10,
                  ease: "linear",
                }}
                className="absolute -top-1 -right-1 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center"
              >
                <Braces className="w-3 h-3 text-white" />
              </motion.div>
            </div>
          </motion.div>

          <motion.h1
            className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-6xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <span className="text-purple-600 dark:text-purple-400">Git Forge</span>
            <span className="block mt-2">Understand Any GitHub Repository</span>
          </motion.h1>

          <motion.p
            className="max-w-2xl mx-auto mt-6 text-xl text-slate-600 dark:text-slate-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            AI-powered insights for open source projects. Get commit summaries and ask questions about any codebase in
            seconds.
          </motion.p>

          <motion.div
            className="flex items-center justify-center gap-4 mx-auto mt-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <Link href={"/sign-up"}>            
            <Button className="px-8 py-6 text-base font-medium text-white transition-all bg-purple-600 rounded-lg hover:bg-purple-700 focus:ring-4 focus:ring-purple-300 ">
              Get Started
            </Button>
            </Link>
            <Button
              variant="outline"
              className="px-8 py-6 text-base font-medium transition-all border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 focus:ring-4 focus:ring-purple-300 "
            >
              View Demo
            </Button>
          </motion.div>
        </motion.div>

        {/* Interactive Component */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="relative mt-16 overflow-hidden bg-white rounded-xl shadow-xl dark:bg-slate-800"
        >
          <div className="flex items-center px-4 py-2 bg-slate-100 dark:bg-slate-700">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="flex items-center justify-center flex-1 text-sm font-medium text-slate-600 dark:text-slate-300">
              <Code2 className="w-4 h-4 mr-2" /> Git Forge Explorer
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 p-2 bg-purple-100 rounded-full dark:bg-purple-900">
                <GitBranch className="w-6 h-6 text-purple-600 dark:text-purple-300" />
              </div>
              <div className="flex-1">
                <div className="flex items-center">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Commit</h3>
                  <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full dark:bg-green-900 dark:text-green-300">
                    Latest
                  </span>
                </div>
                <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700">
                  <code className="text-sm font-mono text-slate-800 dark:text-slate-200">
                    feat(auth): Implement OAuth authentication with GitHub and Google providers
                  </code>
                </div>
                <div className="flex items-center mt-3 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center">
                    <Avatar className="w-5 h-5 mr-1">
                      <Image src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=40&w=400" alt="User" width={400} height={20} />
                    </Avatar>
                    Sarah
                  </span>
                  <span className="mx-2">•</span>
                  <span>2 hours ago</span>
                  <span className="mx-2">•</span>
                  <span className="flex items-center">
                    <Code2 className="w-3 h-3 mr-1" />
                    14 files changed
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-6">
              <div className="flex items-center mb-3">
                <MessageSquare className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Ask about the codebase</h3>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  How does the authentication system work?
                </p>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
               transition={{ delay: 1, duration: 1.5 }}
                  className="h-0.5 bg-gradient-to-r from-purple-400 to-purple-600 mt-3"
                />
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 2 }}
                  className="mt-3 text-sm text-slate-600 dark:text-slate-400"
                >
                  The authentication system uses NextAuth.js to implement OAuth with GitHub and Google providers. It
                  stores user sessions in a database and includes middleware to protect routes...
                </motion.p>
              </div>
            </div>
          </div>

        </motion.div>
      </section>

      <section className="w-full max-w-6xl px-4 py-16 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-slate-900  sm:text-4xl">
            Why Choose <span className="text-purple-600 ">Git Forge</span>
          </h2>
          <p className="max-w-2xl mx-auto mt-4 text-lg text-slate-600 ">
            Powerful AI tools to help you understand and contribute to open source projects faster.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3">
          {demoSection.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full p-6 transition-all border-slate-200 hover:border-purple-300 hover:shadow-md ">
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 mb-4 bg-purple-100 rounded-full ">{feature.icon}</div>
                  <h3 className="mb-2 text-xl font-semibold text-slate-900 ">{feature.title}</h3>
                  <p className="text-slate-600 300">{feature.description}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>


      <section className="w-full max-w-6xl px-4 py-16 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-slate-900  sm:text-4xl">What Our Users Say</h2>
          <p className="max-w-2xl mx-auto mt-4 text-lg text-slate-600 ">
            Hear from developers who use Git Forge to understand and contribute to open source projects.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2">
          {users.map((review, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full p-6 transition-all border-slate-200 hover:shadow-md ">
                <div className="flex flex-col">
                  <div className="flex items-center mb-4">
                    <Avatar className="w-12 h-12 mr-4 border-2 border-purple-200  object-fill">
                      <Image src={review.avatar || "/placeholder.svg"} alt={review.name}  width={400} height={20}/>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 ">{review.name}</h3>
                      <p className="text-sm text-slate-600 ">{review.role}</p>
                    </div>
                  </div>
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-slate-600 ">{review.review}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="w-full max-w-6xl px-4 py-16 mx-auto"
      >
        <div className="p-8 overflow-hidden text-center bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl">
          <h2 className="text-3xl font-bold text-white">Ready to Understand Any GitHub Repository?</h2>
          <p className="max-w-2xl mx-auto mt-4 text-lg text-purple-100">
            Start exploring open source projects with the power of AI today.
          </p>
          <Link href={"/sign-up"}>          
          <Button className="mt-8 bg-white text-purple-700 hover:bg-purple-50">
            Get Started <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          </Link>
        </div>
      </motion.section>

  
      <footer className="w-full max-w-6xl px-4 py-12 mx-auto border-t border-slate-200 ">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center">
              <Github className="w-6 h-6 mr-2 text-purple-600 " />
              <span className="text-xl font-bold text-slate-900 ">Git Forge</span>
            </div>
            <p className="mt-4 text-slate-600 300">
              AI-powered GitHub repository explorer for beginners and experts alike.
            </p>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase text-slate-900 ">Resources</h3>
            <ul className="space-y-2">
              {["Documentation", "Blog", "Community", "GitHub"].map((item, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className="text-slate-600 hover:text-purple-600 "
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase text-slate-900 ">Company</h3>
            <ul className="space-y-2">
              {["About", "Careers", "Contact", "Privacy Policy"].map((item, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className="text-slate-600 hover:text-purple-600 "
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="pt-8 mt-8 text-center border-t border-slate-200 ">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            © {new Date().getFullYear()} Git Forge. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
