import "./style.css";

export default function ProjectListSkeleton() {
  return (
    <>
      {[0, 1, 2, 3].map((key) => {
        return (
          <article className="project-loading" key={key}>
            <div className="image"></div>
            <div className="content">
              <div className="title-group">
                <p className="title mb-2"></p>
                <p className="title w-1/2"></p>
              </div>
              <div className="detail-info">
                <div className="tag-group">
                  <span className="tag"></span>
                  <span className="tag"></span>
                </div>
                <div className="date"></div>
              </div>
              <div className="progress-bar"></div>
            </div>
          </article>
        );
      })}
    </>
  );
}
