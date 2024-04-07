import "./style.css";

export default function ProjectListSkeleton() {
  return (
    <>
      {[0, 1, 2, 3].map((key) => {
        return (
          <article className="project-loading" key={key}>
            <div className="rounded-t-lg bg-slate-200 h-[276px] w-full"></div>
            <div className="py-5 px-4">
              <div className="h-[48px] mb-3.5">
                <div className="h-3.5 rounded-lg bg-slate-200 mb-2"></div>
                <div className="h-3.5 rounded-lg bg-slate-200 w-1/2"></div>
              </div>
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2 h-full w-1/2">
                  <div className="h-5 bg-slate-200 rounded-lg w-1/2"></div>
                  <div className="h-5 bg-slate-200 rounded-lg w-1/2"></div>
                </div>
                <div className="h-2.5 bg-slate-200 rounded-lg w-[40%]"></div>
              </div>
              <div className="h-5 rounded-lg bg-slate-200 mb-4"></div>
            </div>
          </article>
        );
      })}
    </>
  );
}
