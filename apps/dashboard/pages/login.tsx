import {
  Alert,
  Button,
  Divider,
  Group,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Tooltip,
  Transition,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconBrandGithub, IconBrandGoogle, IconServer } from "@tabler/icons-react";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { getCsrfToken, signIn } from "next-auth/react";
import { useState } from "react";

export default function AuthenticationForm({
  csrfToken,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [authLoading, setAuthLoading] = useState(false);
  const form = useForm({
    initialValues: {
      email: "",
      password: "",
    },

    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : "Invalid email"),
      password: (val) => (val.length <= 6 ? "Password should include at least 6 characters" : null),
    },
  });
  const router = useRouter();
  const { error, callbackUrl } = router.query;

  return (
    <>
      <Head>
        <title>PM2 Monitor - Đăng nhập</title>
        <meta name="description" content="PM2 Process Monitor Dashboard" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/png" href="/logo.png" />
      </Head>

      {/* Full Page Background */}
      <main className="min-h-screen w-full bg-bg-primary flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl" />

        {/* Login Card */}
        <div className="relative w-full max-w-md">
          {/* Glass Card */}
          <div className="glass-card p-8 md:p-10">
            {/* Logo & Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700">
                  <IconServer size={28} className="text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  PM2 Monitor
                </h1>
              </div>
              <Text size="sm" c="dimmed">
                Đăng nhập vào tài khoản của bạn
              </Text>
            </div>

            {/* OAuth Buttons */}
            <Group grow mb="md">
              {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
                <Button
                  leftSection={<IconBrandGoogle size={18} />}
                  variant="default"
                  radius="lg"
                  className="btn-secondary hover:border-slate-500"
                >
                  Google
                </Button>
              )}
              {process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID && (
                <Tooltip label="Đăng nhập với GitHub" position="top">
                  <Button
                    leftSection={<IconBrandGithub size={18} />}
                    variant="default"
                    radius="lg"
                    className="btn-secondary hover:border-slate-500"
                    onClick={() =>
                      signIn("github", {
                        callbackUrl: (callbackUrl as string) || "/",
                      })
                    }
                  >
                    Github
                  </Button>
                </Tooltip>
              )}
            </Group>

            {(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID) && (
              <Divider
                label="hoặc tiếp tục với email"
                labelPosition="center"
                my="lg"
                classNames={{
                  label: "text-slate-500 text-xs",
                }}
              />
            )}

            {/* Login Form */}
            <form
              onSubmit={form.onSubmit(async (values) => {
                setAuthLoading(true);
                const res = await signIn("credentials", {
                  ...values,
                  type: "login",
                  redirect: false,
                });
                router.replace(res?.ok ? (callbackUrl as string) || "/" : `/login?error=${res?.error}`);
                setAuthLoading(false);
              })}
            >
              <Stack gap="md">
                {/* Error Alert */}
                <Transition transition="fade" duration={300} mounted={!!error}>
                  {(styles) => (
                    <div style={styles}>
                      <SignInError error={error as string} />
                    </div>
                  )}
                </Transition>

                <input name="csrfToken" type="hidden" defaultValue={csrfToken} />

                {/* Email Field */}
                <TextInput
                  required
                  name="email"
                  label="Email"
                  placeholder="mail@example.com"
                  {...form.getInputProps("email")}
                  radius="lg"
                  classNames={{
                    label: "text-slate-400 text-sm mb-1",
                    input: "bg-slate-900/50 border-slate-700 focus:border-indigo-500",
                  }}
                />

                {/* Password Field */}
                <PasswordInput
                  required
                  name="password"
                  label="Mật khẩu"
                  placeholder="Nhập mật khẩu"
                  {...form.getInputProps("password")}
                  radius="lg"
                  classNames={{
                    label: "text-slate-400 text-sm mb-1",
                    input: "bg-slate-900/50 border-slate-700 focus:border-indigo-500",
                  }}
                />
              </Stack>

              {/* Actions */}
              <Group justify="flex-end" mt="xl">
                <Button
                  type="submit"
                  radius="lg"
                  loading={authLoading}
                  className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 border-0 shadow-lg shadow-indigo-500/20"
                >
                  Đăng nhập
                </Button>
              </Group>
            </form>
          </div>

          {/* Footer */}
          <p className="text-center text-slate-600 text-xs mt-6">
            Được hỗ trợ bởi PM2 Process Manager
          </p>
        </div>
      </main>
    </>
  );
}

const errors = {
  Signin: "Unable to sign in with this account. Please try signing in with a different account.",
  OAuthSignin: "Unable to sign in with this account. Please try signing in with a different account.",
  OAuthCallback: "Unable to sign in with this account. Please try signing in with a different account.",
  OAuthLinked: "Account is linked to an Authentication Provider. Please sign in with the same Authentication Provider.",
  OAuthCreateAccount: "Unable to create an account with this provider. Please try signing in with a different account.",
  EmailCreateAccount:
    "Unable to create an account with this email address. Please try using a different email address.",
  Callback: "Unable to sign in with this account. Please try signing in with a different account.",
  OAuthAccountNotLinked: "Unable to confirm your identity. Please sign in with the same account you used originally.",
  EmailSignin: "Unable to sign in with this email address. Please check that your email address is correct.",
  CredentialsSignin: "Unable to sign in with these credentials. Please check that your details are correct.",
  NotRegistered: "You need to register an account to continue.",
  AccountExists: "An account with the same email address already exists. Please sign in instead.",
  IncorrectPassword: "The password you entered is incorrect. Please try again.",
  default: "Unable to sign in.",
  Unauthorized: "No server/process permission found. Please contact the administrator.",
  UnauthorizedRegister:
    "Registration successful, no server/process permission found. Please contact the administrator.",
  InvalidForm: "Some fields are invalid. Please check the form.",
  InvalidRegistrationCode: "Invalid registration code.",
};

const SignInError = ({ error }: { error: string }) => {
  const errorMessage = error && (errors[error as keyof typeof errors] ?? errors.default);
  return (
    <Alert
      color="red"
      className="bg-rose-500/10 border border-rose-500/20 text-rose-400"
      radius="lg"
    >
      {errorMessage}
    </Alert>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const csrfToken = await getCsrfToken(context);

  return {
    props: {
      csrfToken,
    },
  };
}
