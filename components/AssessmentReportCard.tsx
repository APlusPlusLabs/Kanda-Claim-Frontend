
import React from 'react';
import { Calendar, DollarSign, Wrench, Camera, AlertTriangle, CheckCircle, Link, File } from 'lucide-react';
import { AssignmentReport } from '@/lib/types/claims'

const STORAGES_URL = process.env.NEXT_PUBLIC_APP_WEB_URL + "storage/";

const AssessmentReportCard = ({ reportData }) => {
    // const data = reportData || defaultReportData;
    const data = (typeof reportData === 'string' ? JSON.parse(reportData) : reportData);

    const formatCurrency = (amount: number | bigint | null | undefined) => {
        if (amount == null || isNaN(Number(amount))) {
            return 'N/A';
        }
        return new Intl.NumberFormat('rw-RW', {
            style: 'currency',
            currency: 'RWF'
        }).format(amount);
    };

    const formatDate = (dateString: string | number | Date) => {
        return new Date(dateString).toLocaleString('rw-RW', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // console.log('reportData structure:', JSON.stringify(reportData, null, 2));
    // console.log('AssessmentReportCard received data:', reportData);
    // console.log('Using data:', data);
    // console.log('Labor cost:', data.laborCost, typeof data.laborCost);
    // console.log('Total cost:', data.totalCost, typeof data.totalCost);
    // console.log('Selected parts:', data.selectedParts);
    if (!data) {
        return 'loading report data...'
    }
    const partsCost = data.selectedParts?.length
        ? data.selectedParts.reduce((total, part) => total + (part.cost || 0), 0)
        : 0;
   
    return (
        <div className="max-w-4xl bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Assessment Report</h2>
                        <div className="flex items-center text-blue-100">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>Submitted: {formatDate(data.submittedAt)}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold">{formatCurrency(data.totalCost)}</div>
                        <div className="text-blue-100">Total Cost</div>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-8">
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                            <Wrench className="w-5 h-5 text-green-600 mr-2" />
                            <span className="font-semibold text-green-800">Labor Cost</span>
                        </div>
                        <div className="text-2xl font-bold text-green-700">
                            {formatCurrency(data.laborCost)}
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                            <DollarSign className="w-5 h-5 text-blue-600 mr-2" />
                            <span className="font-semibold text-blue-800">Parts Cost</span>
                        </div>
                        <div className="text-2xl font-bold text-blue-700">
                            {formatCurrency(partsCost)}
                        </div>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                            <CheckCircle className="w-5 h-5 text-purple-600 mr-2" />
                            <span className="font-semibold text-purple-800">Total Cost</span>
                        </div>
                        <div className="text-2xl font-bold text-purple-700">
                            {formatCurrency(data.totalCost)}
                        </div>
                    </div>
                </div>

                {/* Damage Description */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                    <div className="flex items-center mb-3">
                        <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
                        <h3 className="text-lg font-semibold text-orange-800">Damage Description</h3>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{data.damageDescription}</p>
                </div>

                {/* Repair Recommendation */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-center mb-3">
                        <Wrench className="w-5 h-5 text-blue-600 mr-2" />
                        <h3 className="text-lg font-semibold text-blue-800">Repair Recommendation</h3>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{data.repairRecommendation}</p>
                </div>

                {/* Parts to Replace */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Parts to Replace</h3>
                    <div className="space-y-3">
                        {data.partsToReplace?.map((part) => (
                            <div key={part.id} className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                                    <div>
                                        <div className="font-medium text-gray-900">{part.name}</div>
                                        <div className="text-sm text-gray-500 capitalize">Category: {part.category}</div>
                                    </div>
                                </div>
                                <div className="text-lg font-semibold text-gray-900">
                                    {formatCurrency(part.cost)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Photos Section */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center mb-4">
                        <Camera className="w-5 h-5 text-gray-600 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-800">Assessment Photos</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {data.photos?.map((photo, index) => (
                            <div key={index} className="bg-white p-3 rounded-lg border border-gray-200">
                                <div className="aspect-video bg-gray-200 rounded-lg mb-2 flex items-center justify-center">
                                    <img src={STORAGES_URL + photo} alt="" />
                                </div>
                                <p className="text-sm text-gray-600 truncate" title={photo}>
                                    {photo.split('/').pop()}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssessmentReportCard;