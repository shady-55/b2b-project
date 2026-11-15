// بيانات الدخول بتيجي من ملف .env (مش مترفع على git)
function required(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing ${name} in .env (شوف .env.example)`);
    }
    return value;
}

export const credentials = {
    email: required('ADMIN_EMAIL'),
    password: required('ADMIN_PASSWORD'),
};

// الجلسة اللي auth.setup.ts بيحفظها بعد الـ login + OTP
export const AUTH_FILE = '.auth/user.json';
