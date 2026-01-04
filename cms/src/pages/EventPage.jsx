import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import EventLayer from "../components/EventLayer.jsx";

const EventPage = () => {
    return (    
        <MasterLayout>
            <Breadcrumb title="Events Management" />
            <EventLayer />
        </MasterLayout>
    );
};

export default EventPage;