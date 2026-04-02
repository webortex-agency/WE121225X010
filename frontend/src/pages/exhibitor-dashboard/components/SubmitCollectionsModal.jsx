import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/shared/Modal';

const SubmitCollectionsModal = ({ isOpen, onClose, movie }) => {
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        screen: 'Screen 1',
        showTime: '10:00 AM',
        ticketsSold: '',
        ticketPrice: '150',
        totalCollection: '',
        expenses: '',
        notes: '',
    });

    const screens = ['Screen 1', 'Screen 2', 'Screen 3', 'Screen 4'];
    const showTimes = [
        '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
        '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
        '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
        '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
        '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM',
        '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM',
        '10:00 PM', '10:30 PM', '11:00 PM'
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updated = { ...prev, [name]: value };

            // Auto-calculate total collection
            if (name === 'ticketsSold' || name === 'ticketPrice') {
                const tickets = name === 'ticketsSold' ? value : updated.ticketsSold;
                const price = name === 'ticketPrice' ? value : updated.ticketPrice;
                if (tickets && price) {
                    updated.totalCollection = (parseInt(tickets) * parseInt(price)).toString();
                }
            }

            return updated;
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const netCollection = parseInt(formData.totalCollection) - (parseInt(formData.expenses) || 0);
        console.log('Submit Collections:', formData);
        alert(`Collections submitted successfully!\n\nMovie: ${movie?.title}\nDate: ${formData.date}\nShow: ${formData.showTime} - ${formData.screen}\nTickets Sold: ${formData.ticketsSold}\nTotal Collection: ₹${parseInt(formData.totalCollection).toLocaleString()}\nExpenses: ₹${(parseInt(formData.expenses) || 0).toLocaleString()}\nNet Collection: ₹${netCollection.toLocaleString()}`);
        handleClose();
    };

    const handleClose = () => {
        setFormData({
            date: new Date().toISOString().split('T')[0],
            screen: 'Screen 1',
            showTime: '10:00 AM',
            ticketsSold: '',
            ticketPrice: '150',
            totalCollection: '',
            expenses: '',
            notes: '',
        });
        onClose();
    };

    const grossCollection = parseInt(formData.totalCollection) || 0;
    const expenses = parseInt(formData.expenses) || 0;
    const netCollection = grossCollection - expenses;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={`Submit Collections - ${movie?.title || 'Movie'}`}>
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Movie Info Banner */}
                <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                    <div className="flex items-center gap-3">
                        <Icon name="payments" className="w-8 h-8 text-primary" />
                        <div>
                            <h3 className="font-bold text-foreground">{movie?.title}</h3>
                            <p className="text-sm text-muted-foreground">{movie?.genre} • {movie?.language}</p>
                        </div>
                    </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                    {/* Date */}
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-foreground mb-2">
                            Show Date *
                        </label>
                        <input
                            type="date"
                            id="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            max={new Date().toISOString().split('T')[0]}
                            required
                            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Screen Selection */}
                        <div>
                            <label htmlFor="screen" className="block text-sm font-medium text-foreground mb-2">
                                Screen *
                            </label>
                            <select
                                id="screen"
                                name="screen"
                                value={formData.screen}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                            >
                                {screens.map(screen => (
                                    <option key={screen} value={screen}>{screen}</option>
                                ))}
                            </select>
                        </div>

                        {/* Show Time */}
                        <div>
                            <label htmlFor="showTime" className="block text-sm font-medium text-foreground mb-2">
                                Show Time *
                            </label>
                            <select
                                id="showTime"
                                name="showTime"
                                value={formData.showTime}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                            >
                                {showTimes.map(time => (
                                    <option key={time} value={time}>{time}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Tickets Sold */}
                        <div>
                            <label htmlFor="ticketsSold" className="block text-sm font-medium text-foreground mb-2">
                                Tickets Sold *
                            </label>
                            <input
                                type="number"
                                id="ticketsSold"
                                name="ticketsSold"
                                value={formData.ticketsSold}
                                onChange={handleChange}
                                min="0"
                                max="500"
                                required
                                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                            />
                        </div>

                        {/* Ticket Price */}
                        <div>
                            <label htmlFor="ticketPrice" className="block text-sm font-medium text-foreground mb-2">
                                Ticket Price (₹) *
                            </label>
                            <input
                                type="number"
                                id="ticketPrice"
                                name="ticketPrice"
                                value={formData.ticketPrice}
                                onChange={handleChange}
                                min="50"
                                max="1000"
                                required
                                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                            />
                        </div>
                    </div>

                    {/* Total Collection (Auto-calculated) */}
                    <div>
                        <label htmlFor="totalCollection" className="block text-sm font-medium text-foreground mb-2">
                            Gross Collection (₹) *
                        </label>
                        <input
                            type="number"
                            id="totalCollection"
                            name="totalCollection"
                            value={formData.totalCollection}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground font-bold"
                            readOnly
                        />
                        <p className="text-xs text-muted-foreground mt-1">Auto-calculated: Tickets × Price</p>
                    </div>

                    {/* Expenses */}
                    <div>
                        <label htmlFor="expenses" className="block text-sm font-medium text-foreground mb-2">
                            Expenses (₹)
                        </label>
                        <input
                            type="number"
                            id="expenses"
                            name="expenses"
                            value={formData.expenses}
                            onChange={handleChange}
                            min="0"
                            placeholder="Enter any expenses (optional)"
                            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Operational costs, taxes, etc.</p>
                    </div>

                    {/* Notes */}
                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-foreground mb-2">
                            Notes
                        </label>
                        <textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows="3"
                            placeholder="Add any additional notes or comments..."
                            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground resize-none"
                        />
                    </div>
                </div>

                {/* Collection Summary */}
                <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Icon name="account_balance_wallet" className="w-5 h-5 text-green-600" />
                        Collection Summary
                    </h4>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Gross Collection:</span>
                            <span className="text-lg font-bold text-green-600">₹{grossCollection.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Expenses:</span>
                            <span className="text-lg font-semibold text-red-600">- ₹{expenses.toLocaleString()}</span>
                        </div>
                        <div className="border-t border-green-300 pt-2 mt-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-foreground">Net Collection:</span>
                                <span className="text-2xl font-bold text-green-700">₹{netCollection.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Alert */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
                    <Icon name="info" className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-800">
                        Please ensure all collection details are accurate. Once submitted, this data will be sent to the distributor for revenue sharing calculations.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end">
                    <Button
                        type="button"
                        onClick={handleClose}
                        variant="outline"
                    >
                        <Icon name="close" className="w-4 h-4 mr-2" />
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        disabled={!formData.ticketsSold || !formData.totalCollection}
                    >
                        <Icon name="check_circle" className="w-4 h-4 mr-2" />
                        Submit Collections
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default SubmitCollectionsModal;
