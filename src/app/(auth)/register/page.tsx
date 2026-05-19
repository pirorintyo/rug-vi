import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-8">ラグビー動画分析</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">新規登録</h2>
          <RegisterForm />
          <p className="mt-4 text-sm text-center text-gray-500">
            すでにアカウントをお持ちの方は{" "}
            <a href="/login" className="text-blue-600 hover:underline">
              ログイン
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
