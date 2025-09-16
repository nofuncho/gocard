// apps/web/pages/auth-test.tsx
import { useState } from "react";
import { auth, db, storage, serverTimestamp } from "../lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";

export default function AuthTest() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [log, setLog] = useState<string>("");

  const logAppend = (m: string) => setLog((x) => x + m + "\n");

  async function signUp() {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pw);
      logAppend("✅ SignUp OK: " + res.user.uid);

      // Firestore: 내 uid로 users 문서 생성
      await setDoc(doc(db, "users", res.user.uid), {
        email,
        createdAt: serverTimestamp(),
      });
      logAppend("✅ Firestore OK (users/"+res.user.uid+")");

      // Storage: 텍스트 파일 업로드
      const fileRef = ref(storage, `test/${res.user.uid}.txt`);
      await uploadString(fileRef, "hello gocard");
      const url = await getDownloadURL(fileRef);
      logAppend("✅ Storage OK: " + url);
    } catch (e: any) {
      logAppend("❌ SignUp ERR: " + e.message);
    }
  }

  async function signIn() {
    try {
      const res = await signInWithEmailAndPassword(auth, email, pw);
      logAppend("✅ SignIn OK: " + res.user.uid);
    } catch (e: any) {
      logAppend("❌ SignIn ERR: " + e.message);
    }
  }

  return (
    <div style={{ maxWidth: 360, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Firebase 연결 테스트</h1>
      <input
        placeholder="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: "100%", padding: 8, marginBottom: 8 }}
      />
      <input
        placeholder="password"
        type="password"
        value={pw}
        onChange={(e) => setPw(e.target.value)}
        style={{ width: "100%", padding: 8, marginBottom: 8 }}
      />
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={signUp}>Sign Up</button>
        <button onClick={signIn}>Sign In</button>
      </div>
      <pre style={{ background: "#111", color: "#0f0", padding: 12, marginTop: 16, whiteSpace: "pre-wrap" }}>
        {log || "로그 출력 영역"}
      </pre>
    </div>
  );
}
