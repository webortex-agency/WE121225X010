import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/shared/Modal';

const AgreementModal = ({ isOpen, onClose, assignment, onAccept, loading }) => {
    const [agreed, setAgreed] = useState(false);
    const movie = assignment?.movie_id;

    const handleAccept = () => {
        if (agreed) {
            // Pass movie ID for static implementation
            const movieId = movie?._id || assignment._id;
            onAccept(movieId);
        }
    };

    const handleClose = () => {
        setAgreed(false);
        onClose();
    };

    if (!assignment) return null;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={`Distribution Agreement - ${movie?.title || 'Movie'}`}>
            <div className="space-y-6">
                {/* Movie Info */}
                <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                    <h3 className="text-lg font-bold text-foreground mb-2">{movie?.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Icon name="calendar_today" className="w-4 h-4" />
                            <span>
                                {movie?.release_date
                                    ? new Date(movie.release_date).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })
                                    : 'TBA'}
                            </span>
                        </div>
                        {movie?.genre && (
                            <div className="flex items-center gap-1">
                                <Icon name="category" className="w-4 h-4" />
                                <span>{movie.genre}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Access Restriction Notice */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <Icon name="lock" className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-yellow-900 mb-1">Agreement Required</h4>
                            <p className="text-sm text-yellow-800">
                                You must accept this distribution agreement to access and schedule "{movie?.title}".
                                Without acceptance, you will not be able to view movie details, add it to your schedule,
                                or submit collections for this movie.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Agreement Terms */}
                <div className="max-h-96 overflow-y-auto border border-border rounded-lg p-4 bg-muted/30">
                    <h4 className="font-bold text-foreground mb-3">Terms and Conditions for "{movie?.title}"</h4>

                    <div className="space-y-4 text-sm text-muted-foreground">
                        <section>
                            <h5 className="font-semibold text-foreground mb-2">1. Distribution Rights</h5>
                            <p>
                                The exhibitor agrees to screen the movie "{movie?.title}" in accordance with the terms
                                specified in this agreement. The distributor grants the exhibitor non-exclusive rights
                                to exhibit the film at the designated theater location for the agreed period starting
                                from {movie?.release_date ? new Date(movie.release_date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                }) : 'the release date'}.
                            </p>
                        </section>

                        <section>
                            <h5 className="font-semibold text-foreground mb-2">2. Revenue Sharing</h5>
                            <p>
                                The exhibitor agrees to share box office collections for "{movie?.title}" as per the agreed
                                percentage split. All collections must be reported accurately and in a timely manner through
                                the designated platform. The revenue sharing terms are specific to this movie and may differ
                                from other titles.
                            </p>
                        </section>

                        <section>
                            <h5 className="font-semibold text-foreground mb-2">3. Reporting Requirements</h5>
                            <p>
                                Daily collection reports for "{movie?.title}" must be submitted within 24 hours of each
                                screening day. Reports should include show timings, ticket sales, occupancy rates, and
                                gross collections. Failure to submit timely reports may result in penalties or suspension
                                of screening rights.
                            </p>
                        </section>

                        <section>
                            <h5 className="font-semibold text-foreground mb-2">4. Payment Terms</h5>
                            <p>
                                Payments to the distributor for "{movie?.title}" shall be made weekly as per the settlement
                                schedule. Any delays in payment may result in suspension of screening rights for this and
                                future movies. All payments must be made through the approved channels.
                            </p>
                        </section>

                        <section>
                            <h5 className="font-semibold text-foreground mb-2">5. Quality Standards</h5>
                            <p>
                                The exhibitor agrees to maintain high-quality projection and sound systems for screening
                                "{movie?.title}". The movie must be screened in its original format ({movie?.genre || 'specified'} genre)
                                without any unauthorized edits or modifications. Minimum technical specifications must be met.
                            </p>
                        </section>

                        <section>
                            <h5 className="font-semibold text-foreground mb-2">6. Marketing and Promotion</h5>
                            <p>
                                The exhibitor agrees to promote "{movie?.title}" through approved marketing materials
                                and maintain proper display of posters and promotional content at the theater. Marketing
                                materials will be provided by the distributor and must be displayed prominently.
                            </p>
                        </section>

                        <section>
                            <h5 className="font-semibold text-foreground mb-2">7. Screening Schedule</h5>
                            <p>
                                The exhibitor commits to screening "{movie?.title}" for a minimum agreed period with
                                adequate show timings. Any changes to the screening schedule must be communicated and
                                approved by the distributor in advance. Prime time slots should be allocated as per agreement.
                            </p>
                        </section>

                        <section>
                            <h5 className="font-semibold text-foreground mb-2">8. Termination</h5>
                            <p>
                                Either party may terminate this agreement for "{movie?.title}" with written notice if the
                                other party fails to comply with the terms. The distributor reserves the right to withdraw
                                screening rights in case of breach of contract or poor performance.
                            </p>
                        </section>

                        <section>
                            <h5 className="font-semibold text-foreground mb-2">9. Confidentiality</h5>
                            <p>
                                All financial and business information related to "{movie?.title}" shared between parties
                                shall be kept confidential and not disclosed to third parties without prior written consent.
                                This includes collection data, revenue sharing percentages, and marketing strategies.
                            </p>
                        </section>
                    </div>
                </div>

                {/* Agreement Checkbox */}
                <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <input
                        type="checkbox"
                        id="agreement-checkbox"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <label htmlFor="agreement-checkbox" className="text-sm text-gray-700 cursor-pointer">
                        I have read and agree to the terms and conditions of this distribution agreement for
                        <strong> "{movie?.title}"</strong>. I understand that by accepting, I am legally bound to
                        fulfill all obligations as an exhibitor for this specific movie. I acknowledge that without
                        accepting this agreement, I will not have access to schedule or manage this movie.
                    </label>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end">
                    <Button
                        onClick={handleClose}
                        variant="outline"
                        disabled={loading}
                    >
                        <Icon name="close" className="w-4 h-4 mr-2" />
                        Decline
                    </Button>
                    <Button
                        onClick={handleAccept}
                        disabled={!agreed || loading}
                        className="bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Icon name="hourglass_empty" className="w-4 h-4 mr-2 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Icon name="check_circle" className="w-4 h-4 mr-2" />
                                Accept Agreement
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default AgreementModal;
