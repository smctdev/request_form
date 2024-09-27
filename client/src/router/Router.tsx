import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from '../App';
import Dashboard from '../components/Dashboard';
import Login from '../components/Login';
import Registration from '../components/Registration';
import ForgotPassword from '../components/ForgotPassword';
import Request from '../components/Request';
import CreateStockRequistion from '../components/CreateStockRequistion';
import CreatePurchaseOrder from '../components/CreatePurchaseOrder';
import CreateCashDisbursement from '../components/CreateCashDisbursement';
import CreateApplicationCash from '../components/CreateApplicationCash';
import CreateLiquidation from '../components/CreateLiquidation';
import ApproverDashBoard from '../components/ApproverDashBoard';
import ApproverViewRequest from '../components/ApproverViewRequest';
import Profile from '../components/Profile';
import UpdateInformation from '../components/UpdateInformation';
import CreateRefund from '../components/CreateRefund';
import SetupUser from '../components/SetupUser';
import SetupBranch from '../components/SetupBranch';
import SetupApprover from '../components/SetupApprover';
import SetupAreaManager from '../components/SetupAreaManager';
import Help from '../components/Help';
import HelpGuide from '../components/HelpGuide';
import CustomRequest from '../components/CustomRequest';
import RequestApprover from '../components/RequestApprover';
import ApproversStock from '../components/ApproverStock';
import PrintRefund from '../components/PrintRefund';
import PrintStock from '../components/PrintStock';
import PrintPurchase from '../components/PrintPurchase';
import PrintCash from '../components/PrintCash';
import PrintCashDisbursement from '../components/PrintCashDisbursement';
import PrintLiquidation from '../components/PrintLiquidation';

import ResetPassword from '../components/ResetPassword';
import HelpUser from '../components/HelpUser';
import HelpSetup from '../components/HelpSetup';
import SetupAVP from '../components/SetupAVP';
import CreateDiscount from '../components/CreateDiscount';
import PrintDiscount from '../components/PrintDiscount';
interface RouterProps {
  isdarkMode: boolean;
}

const Router: React.FC<RouterProps> = ({isdarkMode}) => {
  return (
    <div>
      <BrowserRouter>
        <Routes>
        <Route path='/' element={<Navigate to="/login" />} />
          <Route path='/login' element={<Login />} />
          <Route path='/registration' element={<Registration />} />
          <Route path='/forgotpassword' element={<ForgotPassword />} />
         
          <Route path='/dashboard' element={<App isdarkMode={isdarkMode} />}>
            <Route index element={<Dashboard />} />
          </Route>
          <Route path='/request' element={<App isdarkMode={isdarkMode} />}>
            <Route index element={<Request />} />
          </Route>
          
          <Route path='/request/approver' element={<App isdarkMode={isdarkMode} />}>
            <Route index element={<RequestApprover />} />
          </Route>
          <Route path='request/sr' element={<App isdarkMode={isdarkMode} />}>
            <Route index element={<CreateStockRequistion />} />
          </Route>
          <Route path='request/pors' element={<App isdarkMode={isdarkMode} />}>
            <Route index element={<CreatePurchaseOrder />} />
          </Route>
          <Route path='request/cdrs' element={<App isdarkMode={isdarkMode} />}>
            <Route index element={<CreateCashDisbursement />} />
          </Route>
          <Route path='request/afca' element={<App isdarkMode={isdarkMode} />}>
            <Route index element={<CreateApplicationCash />} />
          </Route>
          <Route path='request/loae' element={<App isdarkMode={isdarkMode} />}>
            <Route index element={<CreateLiquidation />} />
          </Route>
          <Route path='request/rfr' element={<App isdarkMode={isdarkMode} />}>
            <Route index element={<CreateRefund />} />
          </Route>
          <Route path='request/dr' element={<App isdarkMode={isdarkMode} />}>
            <Route index element={<CreateDiscount />} />
          </Route>
          <Route path='/dashboard/approver' element={<App isdarkMode={isdarkMode} />}>
            <Route index element={<ApproverDashBoard />} />
          </Route>
          <Route path='/request' element={<App isdarkMode={isdarkMode} />}>
            <Route index element={<ApproverViewRequest />} />
          </Route>
          <Route path='/profile' element={<App isdarkMode={isdarkMode} />}>
            <Route index element={<Profile isdarkMode={isdarkMode} />} />
          </Route>
          <Route path='/Update_Profile' element={<App isdarkMode={isdarkMode} />}>
            <Route index element={<UpdateInformation />} />
          </Route>
          <Route path='/setup/User' element={<App isdarkMode={isdarkMode} />}>
            <Route index element={<SetupUser />} />
          </Route>
          <Route path='/setup/Branch' element={<App isdarkMode={isdarkMode} />}>
            <Route index element={<SetupBranch />} />
          </Route>
          <Route path='/setup/Approver' element={<App isdarkMode={isdarkMode} />}>
            <Route index element={<SetupApprover />} />
          </Route>
          <Route path='/setup/AreaManager' element={<App isdarkMode={isdarkMode} />}>
            <Route index element={<SetupAreaManager />} />
          </Route>
          <Route path='/setup/AVP' element={<App isdarkMode={isdarkMode} />}>
            <Route index element={<SetupAVP />} />
          </Route>
          <Route path='/help' element={<App isdarkMode={isdarkMode} />}>
            <Route index element={<Help />} />
          </Route>
          <Route path='/help/guide' element={<App isdarkMode={isdarkMode} />}>
            <Route index element={<HelpGuide />} />
          </Route>
          <Route path='/help/setup' element={<App isdarkMode={isdarkMode} />}>
            <Route index element={<HelpSetup />} />
          </Route>
          <Route path='/help/user' element={<App isdarkMode={isdarkMode} />}>
            <Route index element={<HelpUser />} />
          </Route>
          <Route path='/request/custom' element={<App isdarkMode={isdarkMode} />}>
            <Route index element={<CustomRequest />} />
          </Route>
         {/*  <Route
            path="/request/rfr/print"
            element={<App isdarkMode={isdarkMode} />}
          >
            <Route index element={<PrintRefund />} />
          </Route> */}
        <Route path="/print-refund" element={<PrintRefund />} />
        <Route path="/print-stock" element={<PrintStock />} />
        <Route path="/print-purchase" element={<PrintPurchase />} />
        <Route path="/print-cash" element={<PrintCash />} />
        <Route path="/print-discount" element={<PrintDiscount />} />
        <Route path="/print-cashDisbursement" element={<PrintCashDisbursement />} />
        <Route path="/print-liquidation" element={<PrintLiquidation />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default Router;
