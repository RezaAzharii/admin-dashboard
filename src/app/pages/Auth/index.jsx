// Import Dependencies
import { EnvelopeIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";

// Local Imports
import Logo from "assets/bantul3.svg";
import { Button, Card, Input, InputErrorMsg } from "components/ui";
import { useAuthContext } from "app/contexts/auth/context";
import { schema } from "./schema";
import { Page } from "components/shared/Page";

// ----------------------------------------------------------------------

export default function SignIn() {
  const { login, errorMessage } = useAuthContext();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data) => {
    login({
      email: data.email,
      password: data.password,
    });
  };

  return (
    <Page title="Login">
      <main className="min-h-100vh grid w-full grow grid-cols-1 place-items-center">
        <div className="w-full max-w-[26rem] p-4 sm:px-5">
          <div className="text-center">
            <div className="mx-auto w-40 h-40 sm:w-[120px] sm:h-[100px] flex items-center justify-center">
              
              <img src={Logo} alt="Logo" className="w-full h-full object-contain" />
            </div> 
            <div className="mt-4">
              <h2 className="text-2xl font-semibold text-gray-600 dark:text-dark-100">
                Selamat Datang
              </h2>
            </div>
          </div>

          <Card className="mt-5 rounded-lg p-5 lg:p-7">
            <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
              <div className="space-y-4">
                <Input
                  label="Email"
                  placeholder="Masukkan email kamu"
                  prefix={
                    <EnvelopeIcon
                      className="size-5 transition-colors duration-200"
                      strokeWidth="1"
                    />
                  }
                  {...register("email")}
                  error={errors?.email?.message}
                />

                <Input
                  label="Password"
                  placeholder="Masukkan password kamu"
                  type="password"
                  prefix={
                    <LockClosedIcon
                      className="size-5 transition-colors duration-200"
                      strokeWidth="1"
                    />
                  }
                  {...register("password")}
                  error={errors?.password?.message}
                />
              </div>

              <div className="mt-2">
                <InputErrorMsg
                  when={errorMessage && errorMessage?.message !== ""}
                >
                  {errorMessage?.message}
                </InputErrorMsg>
              </div>

              <Button type="submit" className="mt-5 w-full" color="primary">
                Masuk
              </Button>
            </form>
          </Card>
        </div>
      </main>
    </Page>
  );
}
