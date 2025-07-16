"use client"
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-provider';
import {
    Plus,
    Edit,
    Trash2,
    Copy,
    Eye,
    Filter,
    Search,
    FileText,
    ToggleLeft,
    ToggleRight,
    AlertCircle,
    CheckCircle,
    X,
    Building2,
    CreditCard,
    FileCheck
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard-layout';

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL;

const ContractDraftsManagement = () => {
    const { user, apiRequest } = useAuth();
    const [drafts, setDrafts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        type: '',
        active: '',
        search: ''
    });
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedDraft, setSelectedDraft] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const contractTypes = [
        { value: 'claims', label: 'Claims' },
        { value: 'bids', label: 'Bids' },
        { value: 'garages', label: 'Garages' },
        { value: 'vendors', label: 'Vendors' },
        { value: 'partners', label: 'Partners' }
    ];

    // Fetch contract drafts
    const fetchDrafts = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            if (filters.type) queryParams.append('type', filters.type);
            if (filters.active !== '') queryParams.append('active', filters.active);

            const response = await apiRequest(
                `${API_URL}tenants/${user.tenant_id}/contract-drafts?${queryParams}`,
                'GET'
            );

            if (response.success) {
                setDrafts(response.data);
            }
        } catch (err) {
            setError('Failed to fetch contract drafts');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDrafts();
    }, [filters.type, filters.active]);

    // Filter drafts by search term
    const filteredDrafts = drafts.filter(draft =>
        draft.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        draft.type.toLowerCase().includes(filters.search.toLowerCase())
    );

    // Handle create draft
    const handleCreate = async (formData) => {
        const formdata = { ...formData, user_id: user.id }
        try {
            const response = await apiRequest(
                `${API_URL}tenants/${user.tenant_id}/contract-drafts`,
                'POST',
                formdata
            );

            if (response.success) {
                setDrafts([response.data, ...drafts]);
                setShowCreateModal(false);
                setError(null);
            }
        } catch (err) {
            setError(err.message || 'Failed to create contract draft');
        }
    };

    // Handle update draft
    const handleUpdate = async (formData) => {
        const formdata = { ...formData, user_id: user.id }
        try {
            const response = await apiRequest(
                `${API_URL}tenants/${user.tenant_id}/contract-drafts/${selectedDraft.id}`,
                'PUT',
                formdata
            );

            if (response.success) {
                setDrafts(drafts.map(draft =>
                    draft.id === selectedDraft.id ? response.data : draft
                ));
                setShowEditModal(false);
                setSelectedDraft(null);
                setError(null);
            }
        } catch (err) {
            setError(err.message || 'Failed to update contract draft');
        }
    };

    // Handle duplicate draft
    const handleDuplicate = async (draftId) => {
        const formdata = { user_id: user.id }
        try {
            const response = await apiRequest(
                `${API_URL}tenants/${user.tenant_id}/contract-drafts/${draftId}/duplicate`,
                'POST', formdata
            );

            if (response.success) {
                setDrafts([response.data, ...drafts]);
                setError(null);
            }
        } catch (err) {
            setError(err.message || 'Failed to duplicate contract draft');
        }
    };

    // Handle delete draft
    const handleDelete = async (draftId) => {
        try {
            const response = await apiRequest(
                `${API_URL}tenants/${user.tenant_id}/contract-drafts/${draftId}`,
                'DELETE'
            );

            if (response.success) {
                setDrafts(drafts.filter(draft => draft.id !== draftId));
                setDeleteConfirm(null);
                setError(null);
            }
        } catch (err) {
            setError(err.message || 'Failed to delete contract draft');
        }
    };

    // Toggle draft active status
    const toggleActiveStatus = async (draft) => {
        try {
            const response = await apiRequest(
                `${API_URL}tenants/${user.tenant_id}/contract-drafts/${draft.id}`,
                'PUT',
                { is_active: !draft.is_active }
            );

            if (response.success) {
                setDrafts(drafts.map(d =>
                    d.id === draft.id ? { ...d, is_active: !d.is_active } : d
                ));
            }
        } catch (err) {
            setError(err.message || 'Failed to update draft status');
        }
    };

    return (
        <DashboardLayout
            user={{
                name: user.name,
                role: user.role.name,
                avatar: "/placeholder.svg?height=40&width=40",
            }}
            navigation={[
                { name: "Dashboard", href: "/dashboard/insurer", icon: <Building2 className="h-5 w-5" /> },
                { name: "Contracts", href: "/dashboard/insurer/contracts", icon: <FileText className="h-5 w-5" /> },
                { name: "Payments", href: "/dashboard/insurer/payments", icon: <CreditCard className="h-5 w-5" /> },
                { name: "Settlements", href: "/dashboard/insurer/settlements", icon: <FileCheck className="h-5 w-5" /> },
            ]}
        >
            <div className="space-y-6">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Contract Drafts</h1>
                            <p className="text-gray-600">Manage your company's contract templates and drafts</p>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                        >
                            <Plus size={20} />
                            Create Draft
                        </button>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-2">
                            <AlertCircle className="text-red-500" size={20} />
                            <span className="text-red-700">{error}</span>
                            <button
                                onClick={() => setError(null)}
                                className="ml-auto text-red-500 hover:text-red-700"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    )}

                    {/* Filters */}
                    <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
                        <div className="flex flex-wrap gap-4">
                            <div className="flex-1 min-w-64">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Search drafts..."
                                        value={filters.search}
                                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                            <select
                                value={filters.type}
                                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">All Types</option>
                                {contractTypes.map(type => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                            </select>
                            <select
                                value={filters.active}
                                onChange={(e) => setFilters({ ...filters, active: e.target.value })}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">All Status</option>
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </select>
                        </div>
                    </div>

                    {/* Drafts Table */}
                    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                        {loading ? (
                            <div className="p-8 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="mt-2 text-gray-600">Loading drafts...</p>
                            </div>
                        ) : filteredDrafts.length === 0 ? (
                            <div className="p-8 text-center">
                                <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                                <p className="text-gray-600">No contract drafts found</p>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Version</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredDrafts.map((draft) => (
                                        <tr key={draft.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{draft.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                                                    {draft.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {draft.version}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => toggleActiveStatus(draft)}
                                                    className="flex items-center gap-1"
                                                >
                                                    {draft.is_active ? (
                                                        <>
                                                            <ToggleRight className="text-green-600" size={20} />
                                                            <span className="text-sm text-green-600">Active</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ToggleLeft className="text-gray-400" size={20} />
                                                            <span className="text-sm text-gray-400">Inactive</span>
                                                        </>
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(draft.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedDraft(draft);
                                                            setShowViewModal(true);
                                                        }}
                                                        className="text-gray-400 hover:text-gray-600 p-1"
                                                        title="View"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedDraft(draft);
                                                            setShowEditModal(true);
                                                        }}
                                                        className="text-blue-600 hover:text-blue-800 p-1"
                                                        title="Edit"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDuplicate(draft.id)}
                                                        className="text-green-600 hover:text-green-800 p-1"
                                                        title="Duplicate"
                                                    >
                                                        <Copy size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteConfirm(draft)}
                                                        className="text-red-600 hover:text-red-800 p-1"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Create/Edit Modal */}
                    {(showCreateModal || showEditModal) && (
                        <DraftModal
                            isOpen={showCreateModal || showEditModal}
                            onClose={() => {
                                setShowCreateModal(false);
                                setShowEditModal(false);
                                setSelectedDraft(null);
                            }}
                            onSubmit={showCreateModal ? handleCreate : handleUpdate}
                            draft={selectedDraft}
                            contractTypes={contractTypes}
                            isEdit={showEditModal}
                        />
                    )}

                    {/* View Modal */}
                    {showViewModal && selectedDraft && (
                        <ViewModal
                            isOpen={showViewModal}
                            onClose={() => {
                                setShowViewModal(false);
                                setSelectedDraft(null);
                            }}
                            draft={selectedDraft}
                        />
                    )}

                    {/* Delete Confirmation Modal */}
                    {deleteConfirm && (
                        <DeleteConfirmModal
                            isOpen={!!deleteConfirm}
                            onClose={() => setDeleteConfirm(null)}
                            onConfirm={() => handleDelete(deleteConfirm.id)}
                            draftName={deleteConfirm.name}
                        />
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

// Draft Form Modal Component
const DraftModal = ({ isOpen, onClose, onSubmit, draft, contractTypes, isEdit }) => {
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        template: '',
        required_fields: [],
        optional_fields: [],
        version: '1.0',
        is_active: true,
    });
    const [fieldInput, setFieldInput] = useState('');

    useEffect(() => {
        if (isEdit && draft) {
            setFormData({
                name: draft.name || '',
                type: draft.type || '',
                template: draft.template || '',
                required_fields: draft.required_fields || [],
                optional_fields: draft.optional_fields || [],
                version: draft.version || '1.0',
                is_active: draft.is_active ?? true,
            });
        } else {
            setFormData({
                name: '',
                type: '',
                template: '',
                required_fields: [],
                optional_fields: [],
                version: '1.0',
                is_active: true
            });
        }
    }, [isEdit, draft]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const addField = (fieldType) => {
        if (fieldInput.trim()) {
            setFormData(prev => ({
                ...prev,
                [fieldType]: [...prev[fieldType], fieldInput.trim()]
            }));
            setFieldInput('');
        }
    };

    const removeField = (fieldType, index) => {
        setFormData(prev => ({
            ...prev,
            [fieldType]: prev[fieldType].filter((_, i) => i !== index)
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold">
                        {isEdit ? 'Edit Contract Draft' : 'Create Contract Draft'}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Name *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Type *
                            </label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            >
                                <option value="">Select type...</option>
                                {contractTypes.map(type => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Version
                            </label>
                            <input
                                type="text"
                                value={formData.version}
                                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div className="flex items-center pt-6">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={formData.is_active}
                                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                                Active
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Template Content *
                        </label>
                        <textarea
                            value={formData.template}
                            onChange={(e) => setFormData({ ...formData, template: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32"
                            placeholder="Enter your contract template content..."
                            required
                        />
                    </div>

                    {/* Required Fields */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Required Fields
                        </label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={fieldInput}
                                onChange={(e) => setFieldInput(e.target.value)}
                                placeholder="Add required field..."
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addField('required_fields'))}
                            />
                            <button
                                type="button"
                                onClick={() => addField('required_fields')}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Add
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.required_fields.map((field, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"
                                >
                                    {field}
                                    <button
                                        type="button"
                                        onClick={() => removeField('required_fields', index)}
                                        className="ml-1 text-red-600 hover:text-red-800"
                                    >
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Optional Fields */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Optional Fields
                        </label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={fieldInput}
                                onChange={(e) => setFieldInput(e.target.value)}
                                placeholder="Add optional field..."
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addField('optional_fields'))}
                            />
                            <button
                                type="button"
                                onClick={() => addField('optional_fields')}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                Add
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.optional_fields.map((field, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                                >
                                    {field}
                                    <button
                                        type="button"
                                        onClick={() => removeField('optional_fields', index)}
                                        className="ml-1 text-green-600 hover:text-green-800"
                                    >
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            {isEdit ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// View Modal Component
const ViewModal = ({ isOpen, onClose, draft }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold">Contract Draft Details</h2>
                </div>

                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <p className="text-sm text-gray-900">{draft.name}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                                {draft.type}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
                            <p className="text-sm text-gray-900">{draft.version}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${draft.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                {draft.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Template Content</label>
                        <div className="bg-gray-50 p-3 rounded-lg max-h-40 overflow-y-auto">
                            <pre className="text-sm text-gray-900 whitespace-pre-wrap">{draft.template}</pre>
                        </div>
                    </div>

                    {draft.required_fields && draft.required_fields.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Required Fields</label>
                            <div className="flex flex-wrap gap-2">
                                {draft.required_fields.map((field, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"
                                    >
                                        {field}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {draft.optional_fields && draft.optional_fields.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Optional Fields</label>
                            <div className="flex flex-wrap gap-2">
                                {draft.optional_fields.map((field, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                                    >
                                        {field}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
                            <p className="text-sm text-gray-900">{new Date(draft.created_at).toLocaleString()}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Updated At</label>
                            <p className="text-sm text-gray-900">{new Date(draft.updated_at).toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 p-6 border-t">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

// Delete Confirmation Modal
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, draftName }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <AlertCircle className="text-red-600" size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Delete Contract Draft</h3>
                            <p className="text-sm text-gray-600">This action cannot be undone.</p>
                        </div>
                    </div>

                    <p className="text-sm text-gray-700 mb-6">
                        Are you sure you want to delete the contract draft "{draftName}"?
                    </p>

                    <div className="flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContractDraftsManagement;