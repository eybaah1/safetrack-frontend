import { useState } from 'react';

const issueTypes = [
    { id: 'lighting', label: 'Lighting Issue', icon: '💡', description: 'Broken or dim street lights' },
    { id: 'suspicious', label: 'Suspicious Activity', icon: '👁️', description: 'Unusual or concerning behavior' },
    { id: 'infrastructure', label: 'Infrastructure Problem', icon: '🔧', description: 'Broken gates, fences, or facilities' },
    { id: 'safety_hazard', label: 'Safety Hazard', icon: '⚠️', description: 'Obstacles, spills, or dangerous areas' },
    { id: 'emergency_equipment', label: 'Emergency Equipment', icon: '🧯', description: 'Non-functional emergency tools' },
    { id: 'other', label: 'Other', icon: '📝', description: 'Any other safety concern' },
];

export default function ReportIssueModal({ isOpen, onClose, userPosition }) {
    const [selectedType, setSelectedType] = useState('');
    const [description, setDescription] = useState('');
    const [urgency, setUrgency] = useState('medium');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null); // null, 'success', 'error'

    const handleSubmit = async () => {
        if (!selectedType) return;

        setIsSubmitting(true);

        // Simulate API call - replace with actual API when ready
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Here you would make the actual API call:
            // await reportsAPI.create({
            //     issue_type: selectedType,
            //     description: description,
            //     urgency: urgency,
            //     latitude: userPosition?.lat,
            //     longitude: userPosition?.lng,
            // });

            console.log('Report submitted:', {
                type: selectedType,
                description,
                urgency,
                location: userPosition
            });

            setSubmitStatus('success');

            // Auto-close after showing success
            setTimeout(() => {
                handleReset();
                onClose();
            }, 2500);

        } catch (error) {
            console.error('Failed to submit report:', error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        setSelectedType('');
        setDescription('');
        setUrgency('medium');
        setSubmitStatus(null);
    };

    const handleClose = () => {
        if (!isSubmitting) {
            handleReset();
            onClose();
        }
    };

    if (!isOpen) return null;

    // Success State
    if (submitStatus === 'success') {
        return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <div 
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={handleClose}
                />
                <div 
                    className="relative bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
                    style={{
                        animation: 'scaleIn 0.3s ease-out'
                    }}
                >
                    <div 
                        className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
                        style={{
                            animation: 'bounceIn 0.5s ease-out 0.2s both'
                        }}
                    >
                        <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Report Sent!</h2>
                    <p className="text-gray-600 mb-2">
                        Your report has been successfully submitted to campus authorities.
                    </p>
                    <p className="text-sm text-gray-500">
                        Thank you for helping keep our campus safe! 🛡️
                    </p>
                </div>
            </div>
        );
    }

    // Error State
    if (submitStatus === 'error') {
        return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <div 
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={handleClose}
                />
                <div className="relative bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
                    <div className="w-24 h-24 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Submission Failed</h2>
                    <p className="text-gray-600 mb-6">
                        Something went wrong. Please try again.
                    </p>
                    <button
                        onClick={() => setSubmitStatus(null)}
                        className="w-full py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Main Form
    return (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={handleClose}
            />

            <div 
                className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[92vh] overflow-hidden shadow-2xl"
                style={{
                    animation: 'slideUp 0.3s ease-out'
                }}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between z-10">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Report an Issue</h2>
                        <p className="text-sm text-gray-500">Help us keep campus safe</p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                        disabled={isSubmitting}
                    >
                        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto max-h-[calc(92vh-180px)] p-6">
                    {/* Issue Type Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                            What type of issue are you reporting? <span className="text-red-500">*</span>
                        </label>
                        <div className="grid gap-2">
                            {issueTypes.map((type) => (
                                <button
                                    key={type.id}
                                    type="button"
                                    onClick={() => setSelectedType(type.id)}
                                    className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4 text-left ${
                                        selectedType === type.id
                                            ? 'border-red-500 bg-red-50 shadow-md'
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 bg-white'
                                    }`}
                                >
                                    <span className="text-3xl flex-shrink-0">{type.icon}</span>
                                    <div className="flex-1 min-w-0">
                                        <span className={`block font-semibold ${
                                            selectedType === type.id ? 'text-red-700' : 'text-gray-800'
                                        }`}>
                                            {type.label}
                                        </span>
                                        <span className="text-sm text-gray-500 truncate block">
                                            {type.description}
                                        </span>
                                    </div>
                                    {selectedType === type.id && (
                                        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Urgency Level */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                            Urgency Level
                        </label>
                        <div className="flex gap-2">
                            {[
                                { value: 'low', label: 'Low', color: 'bg-green-500', bgColor: 'bg-green-50', borderColor: 'border-green-500' },
                                { value: 'medium', label: 'Medium', color: 'bg-yellow-500', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-500' },
                                { value: 'high', label: 'High', color: 'bg-red-500', bgColor: 'bg-red-50', borderColor: 'border-red-500' },
                            ].map((level) => (
                                <button
                                    key={level.value}
                                    type="button"
                                    onClick={() => setUrgency(level.value)}
                                    className={`flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all ${
                                        urgency === level.value
                                            ? `${level.borderColor} ${level.bgColor}`
                                            : 'border-gray-200 bg-white hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${level.color}`}></span>
                                        <span className={urgency === level.value ? 'text-gray-900' : 'text-gray-600'}>
                                            {level.label}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Description Textarea */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Describe the Issue
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Please provide specific details about the issue, such as exact location, what you observed, etc..."
                            rows={4}
                            className="w-full p-4 rounded-2xl border-2 border-gray-200 focus:border-red-500 focus:ring-0 outline-none resize-none text-gray-800 placeholder-gray-400 transition-colors"
                            maxLength={500}
                        />
                        <div className="flex justify-end mt-1">
                            <span className="text-xs text-gray-400">{description.length}/500</span>
                        </div>
                    </div>

                    {/* Location Info Card */}
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-xl">📍</span>
                            </div>
                            <div>
                                <p className="font-medium text-gray-800 text-sm">Location Attached</p>
                                <p className="text-xs text-gray-600 mt-0.5">
                                    Your current location will be included to help authorities respond quickly.
                                </p>
                                {userPosition && (
                                    <p className="text-xs text-blue-600 mt-1 font-mono">
                                        {userPosition.lat?.toFixed(5)}, {userPosition.lng?.toFixed(5)}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit Button - Sticky Footer */}
                <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-100">
                    <button
                        onClick={handleSubmit}
                        disabled={!selectedType || isSubmitting}
                        className={`w-full py-4 rounded-2xl font-bold text-lg transition-all transform ${
                            selectedType && !isSubmitting
                                ? 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white shadow-lg hover:shadow-xl active:scale-[0.98]'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        {isSubmitting ? (
                            <span className="flex items-center justify-center gap-3">
                                <span className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></span>
                                Sending Report...
                            </span>
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                                Submit Report
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* CSS Animations */}
            <style>{`
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes scaleIn {
                    from {
                        opacity: 0;
                        transform: scale(0.8);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                @keyframes bounceIn {
                    0% {
                        transform: scale(0);
                    }
                    50% {
                        transform: scale(1.1);
                    }
                    100% {
                        transform: scale(1);
                    }
                }
            `}</style>
        </div>
    );
}