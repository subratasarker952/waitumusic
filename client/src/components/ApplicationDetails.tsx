import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface ApplicationProps {
  application: any;
}

const ApplicationDetails: React.FC<ApplicationProps> = ({ application }) => {
  return (
    <Card className="max-w-3xl mx-auto my-6">
      <CardHeader>
        <CardTitle>
          Application #{application.id} - <span className="text-sm text-gray-500">{application.status}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Applicant Info */}
        <div>
          <h4 className="font-semibold">Applicant</h4>
          <p>User ID: {application.applicantUserId}</p>
        </div>

        {/* Requested Role & Tier */}
        <div>
          <h4 className="font-semibold">Requested Role & Tier</h4>
          <p>Role ID: {application.requestedRoleId}</p>
          <p>Management Tier ID: {application.requestedManagementTierId}</p>
        </div>

        {/* Application Reason */}
        <div>
          <h4 className="font-semibold">Reason</h4>
          <p>{application.applicationReason}</p>
        </div>

        {/* Business Plan & Revenue */}
        <div>
          <h4 className="font-semibold">Business Plan</h4>
          <p>{application.businessPlan}</p>
          <p><strong>Expected Revenue:</strong> ${application.expectedRevenue}</p>
        </div>

        {/* Portfolio & Social Media */}
        <div>
          <h4 className="font-semibold">Portfolio & Social Media</h4>
          <a href={application.portfolioLinks} target="_blank" className="text-blue-600 underline">
            Portfolio Link
          </a>
          <br />
          <a href={application.socialMediaMetrics} target="_blank" className="text-blue-600 underline">
            Social Metrics
          </a>
        </div>

        {/* Contract Terms */}
        {application.contractTerms && (
          <div>
            <h4 className="font-semibold">Contract Terms</h4>
            <ul className="list-disc ml-6">
              <li>Notice Period: {application.contractTerms.termination.noticePeriod} Days</li>
              <li>Early Termination Fee: ${application.contractTerms.termination.earlyTerminationFee}</li>
              <li>Admin Commission: {application.contractTerms.adminCommission}%</li>
              <li>Services Discount: {application.contractTerms.servicesDiscount}%</li>
              <li>Marketplace Discount: {application.contractTerms.marketplaceDiscount}%</li>
              <li>Min Commitment: {application.contractTerms.minimumCommitmentMonths} months</li>
            </ul>
          </div>
        )}

        {/* Timeline */}
        <div>
          <h4 className="font-semibold">Timeline</h4>
          <p>Submitted At: {new Date(application.submittedAt).toLocaleString()}</p>
          <p>Created At: {new Date(application.createdAt).toLocaleString()}</p>
          <p>Updated At: {new Date(application.updatedAt).toLocaleString()}</p>
          {application.reviewedAt && <p>Reviewed At: {new Date(application.reviewedAt).toLocaleString()}</p>}
          {application.approvedAt && <p>Approved At: {new Date(application.approvedAt).toLocaleString()}</p>}
          {application.signedAt && <p>Signed At: {new Date(application.signedAt).toLocaleString()}</p>}
          {application.endDate && <p>End Date: {new Date(application.endDate).toLocaleString()}</p>}
        </div>

        {/* Notes & Rejection */}
        {application.notes && (
          <div>
            <h4 className="font-semibold">Notes</h4>
            <p>{application.notes}</p>
          </div>
        )}
        {application.rejectionReason && (
          <div className="text-red-600">
            <h4 className="font-semibold">Rejection Reason</h4>
            <p>{application.rejectionReason}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ApplicationDetails;
