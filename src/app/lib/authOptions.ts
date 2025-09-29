import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { sql } from "@vercel/postgres";

export const authOptions = {
    providers: [
        CredentialsProvider({
        name: "Credentials",
        credentials: {
            email: { label: "Email", type: "email", placeholder: "your@example.com" },
            password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
            if (!credentials?.email || !credentials?.password) {
            throw new Error("Missing credentials");
            }

            // Get user from database
            const data = await sql`SELECT * FROM usuario WHERE email = ${credentials.email}`;
            const user = data.rows[0];

            if (!user || !(await compare(credentials.password, user.password))) {
            throw new Error("Invalid credentials");
            }

            return { id: user.id, name: user.nombre_completo, email: user.email };
        },
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    session: { strategy: "jwt" as const },
};