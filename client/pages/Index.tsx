import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const BG_URL =
  "https://cdn.builder.io/api/v1/image/assets%2Fd1e126ea874f47f691fbdae8fa279b40%2Fc0fe76ed1cc94947a3697d9b31f4d03b?format=webp&width=1200";

export default function Index() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const isAuthed = localStorage.getItem("sips_auth") === "true";
    if (isAuthed) navigate("/dashboard");
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "dalle" && password === "asrahabu") {
      localStorage.setItem("sips_auth", "true");
      localStorage.setItem("sips_user", JSON.stringify({ username }));
      navigate("/dashboard");
      return;
    }
    setError("Username atau password tidak sesuai");
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center">
      <img
        src={BG_URL}
        alt="Siswa belajar di kelas"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />

      <div className="relative z-10 w-full max-w-md px-4 md:px-0">
        <Card className="backdrop-blur-md bg-white/90 dark:bg-slate-900/90 shadow-xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-xl md:text-2xl font-extrabold tracking-tight">
              Sistem Informasi Penilaian Siswa
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              SMPN 2 Baraka, Kab. Enrekang
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Username</label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  required
                />
              </div>
              {error && (
                <p className="text-destructive text-sm" role="alert">
                  {error}
                </p>
              )}
              <Button type="submit" className="w-full h-11 font-semibold">
                Masuk
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Gunakan Username: <span className="font-semibold">dalle</span> dan Password: <span className="font-semibold">asrahabu</span>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
