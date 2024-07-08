import Transcript from "@/app/components/Transcript";
import Legend from "@/app/components/Legend/Legend";

export default function HomePage() {
  return (
    <section className="grid h-full w-full">
      <div className="w-full">
        <h1 className="pb-9 text-center text-3xl font-medium">
          Transcribi tus audios y conversaciones a texto en 3 clicks!
        </h1>
        <Transcript />
      </div>
      <div className="w-full">
        <Legend />
      </div>
    </section>
  );
}
