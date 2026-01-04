import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import NewsLayer from "../components/NewsLayer";

const NewsPage = () => {
  return (
    <MasterLayout>
      <div className="container-fluid">
        <Breadcrumb title="News Management" />
        <NewsLayer />
      </div>
    </MasterLayout>
  );
};

export default NewsPage;
