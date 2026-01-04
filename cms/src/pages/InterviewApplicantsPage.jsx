import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import InterviewApplicantsLayer from "../components/InterviewApplicantsLayer";

const InterviewApplicantsPage = () => {
  return (
    <MasterLayout>
      <Breadcrumb title="Interview Applicants" />
      <InterviewApplicantsLayer />
    </MasterLayout>
  );
};

export default InterviewApplicantsPage;
