"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

interface FormValues {
  email: string;
  password: string;
}

export function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("メールアドレスまたはパスワードが正しくありません");
    } else {
      router.push("/videos");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">メールアドレス</label>
        <input
          type="email"
          {...register("email", { required: true })}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.email && <p className="text-red-500 text-xs mt-1">必須項目です</p>}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">パスワード</label>
        <input
          type="password"
          {...register("password", { required: true })}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.password && <p className="text-red-500 text-xs mt-1">必須項目です</p>}
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white rounded py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "ログイン中..." : "ログイン"}
      </button>
    </form>
  );
}
