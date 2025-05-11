import { resetPasswordAction } from "@/app/actions";

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4">
      <h1 className="text-2xl font-medium">Reset Password</h1>
      <p className="text-sm text-foreground/60">
        Please enter your new password below.
      </p>
      <form className="flex flex-col w-full max-w-md p-4 gap-2 [&>input]:mb-4">
        <label htmlFor="password" className="text-sm font-medium">
          New password
        </label>
        <input
          type="password"
          name="password"
          placeholder="New password"
          required
          className="p-2 border rounded"
        />
        <label htmlFor="confirmPassword" className="text-sm font-medium">
          Confirm password
        </label>
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm password"
          required
          className="p-2 border rounded"
        />
        <button
          type="submit"
          formAction={resetPasswordAction}
          className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
        >
          Reset password
        </button>
      </form>
    </div>
  );
}
