import MasterLayout from '../masterLayout/MasterLayout'
import Breadcrumb from '../components/Breadcrumb'
import AdminsLayer from '../components/AdminsLayer'

function FreelancersPage() {
    return (
        <>

            {/* MasterLayout */}
            <MasterLayout>

                {/* Breadcrumb */}
                <Breadcrumb title="Admins" />


                <AdminsLayer />


            </MasterLayout>

        </>
    );
}

export default FreelancersPage