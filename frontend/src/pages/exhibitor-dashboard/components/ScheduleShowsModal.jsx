import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/shared/Modal';

const ScheduleShowsModal = ({ isOpen, onClose, movie }) => {
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        screen: 'Screen 1',
        showTime: '10:00',
        ticketPrice: '150',
        totalSeats: '150',
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
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Schedule Show:', formData);
        alert(`Show scheduled successfully!\n\nMovie: ${movie?.title}\nDate: ${formData.date}\nScreen: ${formData.screen}\nTime: ${formData.showTime}\nPrice: ₹${formData.ticketPrice}\nSeats: ${formData.totalSeats}`);
        onClose();
    };

    const handleClose = () => {
        setFormData({
            date: new Date().toISOString().split('T')[0],
            screen: 'Screen 1',
            showTime: '10:00',
            ticketPrice: '150',
            totalSeats: '150',
        });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={`Schedule Show - ${movie?.title || 'Movie'}`}>
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Movie Info Banner */}
                <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                    <div className="flex items-center gap-3">
                        <Icon name="movie" className="w-8 h-8 text-primary" />
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
                            min={new Date().toISOString().split('T')[0]}
                            required
                            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                        />
                    </div>

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

                    {/* Total Seats */}
                    <div>
                        <label htmlFor="totalSeats" className="block text-sm font-medium text-foreground mb-2">
                            Total Seats Available *
                        </label>
                        <input
                            type="number"
                            id="totalSeats"
                            name="totalSeats"
                            value={formData.totalSeats}
                            onChange={handleChange}
                            min="50"
                            max="500"
                            required
                            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                        />
                    </div>
                </div>

                {/* Summary */}
                <div className="bg-muted/30 rounded-lg p-4 border border-border">
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Icon name="info" className="w-5 h-5 text-primary" />
                        Schedule Summary
                    </h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Date:</span>
                            <span className="font-medium text-foreground">{new Date(formData.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Screen:</span>
                            <span className="font-medium text-foreground">{formData.screen}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Time:</span>
                            <span className="font-medium text-foreground">{formData.showTime}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Ticket Price:</span>
                            <span className="font-medium text-foreground">₹{formData.ticketPrice}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Seats:</span>
                            <span className="font-medium text-foreground">{formData.totalSeats}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-border">
                            <span className="text-muted-foreground">Potential Revenue:</span>
                            <span className="font-bold text-green-600">₹{(parseInt(formData.ticketPrice) * parseInt(formData.totalSeats)).toLocaleString()}</span>
                        </div>
                    </div>
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
                        className="bg-primary hover:bg-primary/90 text-white"
                    >
                        <Icon name="check_circle" className="w-4 h-4 mr-2" />
                        Schedule Show
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default ScheduleShowsModal;
