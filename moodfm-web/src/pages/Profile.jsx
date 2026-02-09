import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { toast, ToastContainer } from 'react-toastify'
import Button from '../components/UI/Button'
import Input from '../components/UI/Input'
import { Icon } from '@iconify/react'
import axiosInstance from '../axiosConfig'
import Swal from 'sweetalert2'

import Header from '../components/Layout/Header'
import Footer from '../components/Layout/Footer'

const Profile = () => {
    const { user, updateUser } = useAuth()

    const [tracks, setTracks] = useState([])
    const [loading, setLoading] = useState(false)
    const [imagePreview, setImagePreview] = useState(user?.image || '')
    const [selectedFile, setSelectedFile] = useState(null)
    const fileInputRef = React.useRef(null)
    const [isEditingInfo, setIsEditingInfo] = useState(false)
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phoneNumber: user?.phoneNumber || '',
        image: user?.image || ''
    })
    const [errors, setErrors] = useState({
        name: '',
        email: '',
        phoneNumber: ''
    })
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: ''
    })
    const [playingTrack, setPlayingTrack] = useState(null)
    const audioRefs = React.useRef({})
    const videoRefs = React.useRef({})

    useEffect(() => {
        const userImage = user?.image?.url || (typeof user?.image === 'string' ? user?.image : '') || ''
        setImagePreview(userImage)
        setFormData({
            name: user?.name || '',
            email: user?.email || '',
            phoneNumber: user?.phoneNumber || '',
            image: userImage
        })
    }, [user])

    useEffect(() => {
        const fetchTracks = async () => {
            try {
            setLoading(true)
            const response = await axiosInstance.get('/uploadtrack/my-tracks')
            const filteredTracks = response.data.data.filter((track) => track.channelId.name === 'MoodFM')
            console.log(filteredTracks)
            setTracks(filteredTracks)
            setLoading(false)
            } catch (error) {
                console.error('Error fetching tracks:', error)
                    toast.error('Failed to fetch tracks')
                    setLoading(false)
                } finally {
                    setLoading(false)
                }
        }
        fetchTracks()
    }, [])

    // Handle audio/video playback when playingTrack changes
    useEffect(() => {
        if (playingTrack) {
            const track = tracks.find(t => t._id === playingTrack)
            if (track) {
                if (track.songFile?.resource_type === 'audio' && audioRefs.current[playingTrack]) {
                    const audio = audioRefs.current[playingTrack]
                    audio.play().catch((error) => {
                        console.error('Error playing audio:', error)
                        toast.error('Error playing audio')
                        setPlayingTrack(null)
                    })
                } else if (track.songFile?.resource_type === 'video' && videoRefs.current[playingTrack]) {
                    const video = videoRefs.current[playingTrack]
                    video.play().catch((error) => {
                        console.error('Error playing video:', error)
                        toast.error('Error playing video')
                        setPlayingTrack(null)
                    })
                }
            }
        }
    }, [playingTrack, tracks])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value
        })
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            })
        }
    }

    const handleInfoSubmit = async (e) => {
        e.preventDefault()

        // Validation
        const newErrors = {}
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required'
        }
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email'
        }
        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = 'Phone number is required'
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        try {
            const response = await axiosInstance.put('/user/profile', formData)
            if (response.data) {
                updateUser(response.data.data)
                toast.success('Profile updated successfully')
                setIsEditingInfo(false)
            }
        } catch (error) {
            console.error(error)
            toast.error(error.response?.data?.message || 'Failed to update profile')
        }
    }

    const handleCancelEdit = () => {
        setFormData({
            name: user?.name || '',
            email: user?.email || '',
            phoneNumber: user?.phoneNumber || '',
            image: user?.image || ''
        })
        setErrors({})
        setIsEditingInfo(false)
        setImagePreview(user?.image || '')
        setSelectedFile(null)
    }

    const handleImageClick = () => {
        fileInputRef.current?.click()
    }

    const handleImageChange = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select a valid image file')
            return
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size must be less than 5MB')
            return
        }

        setSelectedFile(file)

        // Create preview immediately
        const reader = new FileReader()
        reader.onloadend = () => {
            setImagePreview(reader.result)
        }
        reader.readAsDataURL(file)

        // Upload image immediately
        try {
            const formDataToSend = new FormData()
            formDataToSend.append('image', file)
            formDataToSend.append('name', formData.name)
            formDataToSend.append('email', formData.email)
            formDataToSend.append('phoneNumber', formData.phoneNumber)

            const response = await axiosInstance.put('/user/profile', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })

            if (response.data && response.data.data) {
                const updatedUser = response.data.data
                // Get the image URL from the response - backend returns image.url
                const newImageUrl = updatedUser.image?.url || (typeof updatedUser.image === 'string' ? updatedUser.image : '')

                // Update user context
                updateUser(updatedUser)

                // Update form data
                setFormData({
                    ...formData,
                    image: newImageUrl
                })

                // Update preview with the server URL - force React to re-render
                if (newImageUrl) {
                    // Clear first then set to force update
                    setImagePreview('')
                    // Use requestAnimationFrame to ensure state update happens
                    requestAnimationFrame(() => {
                        setImagePreview(newImageUrl)
                    })
                }

                toast.success('Profile image updated successfully')
            }
        } catch (error) {
            console.error(error)
            toast.error(error.response?.data?.message || 'Failed to update profile image')
            // Revert preview on error
            const userImage = user?.image?.url || (typeof user?.image === 'string' ? user?.image : '') || ''
            setImagePreview(userImage)
            setSelectedFile(null)
        }
    }

    const handlePasswordChange = async () => {
        const { value: formValues } = await Swal.fire({
            title: 'Change Password',
            html: `
                <div style="text-align: left; width: 100%; max-width: 100%; box-sizing: border-box; overflow-x: hidden;">
                    <label style="display: block; margin-bottom: 0.5rem; color: var(--text-primary);">Current Password</label>
                    <input id="current-password" type="password" class="swal2-input-custom" placeholder="Enter current password" style="width: 100%; max-width: 100%; margin-bottom: 1rem; box-sizing: border-box;">
                    <label style="display: block; margin-bottom: 0.5rem; color: var(--text-primary);">New Password</label>
                    <input id="new-password" type="password" class="swal2-input-custom" placeholder="Enter new password" style="width: 100%; max-width: 100%; margin-bottom: 0.5rem; box-sizing: border-box;">
                    <div id="password-requirements" style="font-size: 12px; color: var(--text-secondary); margin-top: 0.5rem;">
                        <div id="req-length" style="margin-bottom: 0.25rem;">• Must be at least 8 characters</div>
                        <div id="req-special" style="margin-bottom: 0.25rem;">• Must contain one special character</div>
                    </div>
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Change Password',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#33CC66',
            cancelButtonColor: '#d33',
            background: 'var(--background-color)',
            color: 'var(--text-primary)',
            customClass: {
                popup: 'swal2-popup-custom',
                title: 'swal2-title-custom',
                htmlContainer: 'swal2-html-container-custom',
                input: 'swal2-input-custom',
                confirmButton: 'swal2-confirm-custom',
                cancelButton: 'swal2-cancel-custom'
            },
            width: window.innerWidth <= 768 ? '90%' : '60%',
            maxWidth: window.innerWidth <= 768 ? '95%' : '500px',
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                const newPasswordInput = document.getElementById('new-password')
                if (newPasswordInput) {
                    newPasswordInput.addEventListener('input', (e) => {
                        const password = e.target.value
                        const reqLength = document.getElementById('req-length')
                        const reqSpecial = document.getElementById('req-special')

                        // Check length
                        if (password.length >= 8) {
                            reqLength.style.color = 'var(--color-green)'
                        } else {
                            reqLength.style.color = 'var(--text-secondary)'
                        }

                        // Check special character
                        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
                            reqSpecial.style.color = 'var(--color-green)'
                        } else {
                            reqSpecial.style.color = 'var(--text-secondary)'
                        }
                    })
                }
            },
            preConfirm: async () => {
                const currentPassword = document.getElementById('current-password').value
                const newPassword = document.getElementById('new-password').value

                // Validation
                if (!currentPassword) {
                    Swal.showValidationMessage('Please enter your current password')
                    return false
                }
                if (!newPassword) {
                    Swal.showValidationMessage('Please enter a new password')
                    return false
                }
                if (newPassword.length < 8) {
                    Swal.showValidationMessage('New password must be at least 8 characters')
                    return false
                }
                if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
                    Swal.showValidationMessage('New password must contain at least one special character')
                    return false
                }

                // Disable buttons and show loading
                Swal.disableButtons()
                Swal.update({
                    confirmButtonText: 'Changing Password...',
                    showCancelButton: false
                })

                try {
                    await axiosInstance.put('/user/change-password', {
                        currentPassword: currentPassword,
                        newPassword: newPassword
                    })

                    // Success - close modal and show toast
                    Swal.close()
                    toast.success('Password changed successfully')
                    setPasswordData({ currentPassword: '', newPassword: '' })
                    return true
                } catch (error) {
                    // Re-enable buttons on error
                    Swal.enableButtons()
                    Swal.update({
                        confirmButtonText: 'Change Password',
                        showCancelButton: true
                    })

                    const errorMessage = error.response?.data?.message || 'Failed to change password'
                    Swal.showValidationMessage(errorMessage)
                    toast.error(errorMessage)
                    return false
                }
            }
        })
    }

    return (
        <>
            <Header />
            <ToastContainer />

            <div className="profile-container container d-flex flex-column align-items-center justify-content-center py-5 mb-5">
                {/* Profile Image */}
                <div className="profile-image-container d-flex flex-column align-items-center justify-content-center mb-4">
                    <div className="profile-image-preview position-relative">
                        <img src={imagePreview} alt="Profile" />
                        <div
                            className="profile-image-edit-icon position-absolute d-flex align-items-center"
                            onClick={handleImageClick}
                            onMouseEnter={(e) => {
                                e.target.style.opacity = '0.8'
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.opacity = '1'
                            }}
                        >
                            <Icon
                                icon="material-symbols:edit-square-outline-rounded"
                                className="edit-photo-icon"
                            />
                            <span className="edit-photo-text">
                                Edit photo
                            </span>
                        </div>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ display: 'none' }}
                    />
                </div>

                {/* Private Information */}
                <div className="profile-section mb-5">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h3 className="mb-0 profile-title">Private Information</h3>
                        {!isEditingInfo ? (
                            <Button
                                variant="green"
                                size="sm"
                                onClick={() => setIsEditingInfo(true)}
                                uppercase={false}
                                icon="material-symbols:edit-outline"
                                className="d-flex align-items-center justify-content-center gap-2"
                            >
                                Edit
                            </Button>
                        ) : (
                            <div className="d-flex gap-2">
                                <Button
                                    variant="green"
                                    size="sm"
                                    onClick={handleInfoSubmit}
                                    uppercase={false}
                                >
                                    Save
                                </Button>
                                <Button
                                    variant="red"
                                    size="sm"
                                    onClick={handleCancelEdit}
                                    uppercase={false}
                                >
                                    Cancel
                                </Button>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleInfoSubmit}>
                        <div className="mb-3">
                            {isEditingInfo ? (
                                <Input
                                    variant="talent"
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    icon="material-symbols:person-outline"
                                    focusColor="green"
                                    error={errors.name}
                                    className="profile-edit-input"
                                />
                            ) : (
                                <div className="d-flex align-items-center" style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--lines-color)' }}>
                                    <Icon icon="material-symbols:person-outline" style={{ fontSize: '24px', color: 'var(--text-secondary)', marginRight: '1rem' }} />
                                    <span style={{ color: 'var(--text-primary)', fontSize: '16px' }}>{formData.name || 'Not set'}</span>
                                </div>
                            )}
                        </div>

                        <div className="mb-3">
                            {isEditingInfo ? (
                                <Input
                                    variant="talent"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    icon="material-symbols:mail-outline"
                                    focusColor="green"
                                    error={errors.email}
                                    className="profile-edit-input"
                                />
                            ) : (
                                <div className="d-flex align-items-center" style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--lines-color)' }}>
                                    <Icon icon="material-symbols:mail-outline" style={{ fontSize: '24px', color: 'var(--text-secondary)', marginRight: '1rem' }} />
                                    <span style={{ color: 'var(--text-primary)', fontSize: '16px' }}>{formData.email || 'Not set'}</span>
                                </div>
                            )}
                        </div>

                        <div className="mb-3">
                            {isEditingInfo ? (
                                <Input
                                    variant="talent"
                                    type="tel"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    icon="material-symbols:phone-in-talk-outline-rounded"
                                    focusColor="green"
                                    error={errors.phoneNumber}
                                    className="profile-edit-input"
                                />
                            ) : (
                                <div className="d-flex align-items-center" style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--lines-color)' }}>
                                    <Icon icon="material-symbols:phone-in-talk-outline-rounded" style={{ fontSize: '24px', color: 'var(--text-secondary)', marginRight: '1rem' }} />
                                    <span style={{ color: 'var(--text-primary)', fontSize: '16px' }}>{formData.phoneNumber || 'Not set'}</span>
                                </div>
                            )}
                        </div>
                    </form>
                </div>

                {/* Change Password */}
                <div className="profile-section mb-5">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h3 className="mb-0 profile-title">Change Password</h3>
                        <Button
                            variant="green"
                            size="sm"
                            onClick={handlePasswordChange}
                            uppercase={false}
                            icon="material-symbols:edit-outline"
                            className="d-flex align-items-center justify-content-center gap-2"
                        >
                            Edit
                        </Button>
                    </div>

                    <div className="d-flex align-items-center" style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--lines-color)' }}>
                        <Icon icon="material-symbols:lock-outline" style={{ fontSize: '24px', color: 'var(--text-secondary)', marginRight: '1rem' }} />
                        <span style={{ color: 'var(--text-primary)', fontSize: '16px', letterSpacing: '2px' }}>************</span>
                    </div>
                </div>

                {/* My Track Section */}
                <div className="profile-section d-flex flex-column align-items-start justify-content-start mb-5">
                    <h3 className="mb-4 profile-title">My Tracks</h3>
                    {loading ? (
                        <div className="d-flex align-items-center justify-content-center">
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : (
                    <div className="tracks-container d-flex flex-column align-items-start justify-content-start">
                        {tracks.map((track, index) => {
                            const isPlaying = playingTrack === track._id
                            const getStatusColor = (status) => {
                                switch (status) {
                                    case 'Pending':
                                        return 'warning'
                                    case 'Checked':
                                        return 'info'
                                    case 'Approved':
                                        return 'success'
                                    case 'Declined':
                                        return 'danger'
                                    default:
                                        return 'secondary'
                                }
                            }

                            return (
                                <div 
                                    key={track._id} 
                                    className={`track-item d-flex align-items-center justify-content-between gap-4 ${index > 0 ? 'track-item-not-first' : ''}`}
                                >
                                    {/* Song File with Play Icon */}
                                    <div 
                                        className={`track-file-container position-relative d-flex align-items-center justify-content-center ${track.songFile?.resource_type === 'audio' ? 'track-file-audio' : ''}`}
                                        onClick={() => {
                                            if (isPlaying) {
                                                // Pause current track
                                                if (track.songFile?.resource_type === 'audio') {
                                                    const audio = audioRefs.current[track._id]
                                                    if (audio) {
                                                        audio.pause()
                                                        audio.currentTime = 0
                                                    }
                                                } else if (track.songFile?.resource_type === 'video') {
                                                    const video = videoRefs.current[track._id]
                                                    if (video) {
                                                        video.pause()
                                                        video.currentTime = 0
                                                    }
                                                }
                                                setPlayingTrack(null)
                                            } else {
                                                // Stop any currently playing track
                                                if (playingTrack) {
                                                    const prevAudio = audioRefs.current[playingTrack]
                                                    const prevVideo = videoRefs.current[playingTrack]
                                                    if (prevAudio) {
                                                        prevAudio.pause()
                                                        prevAudio.currentTime = 0
                                                    }
                                                    if (prevVideo) {
                                                        prevVideo.pause()
                                                        prevVideo.currentTime = 0
                                                    }
                                                }
                                                setPlayingTrack(track._id)
                                            }
                                        }}
                                    >
                                        {track.songFile?.resource_type === 'video' ? (
                                            <>
                                                <video 
                                                    ref={(el) => {
                                                        if (el) {
                                                            videoRefs.current[track._id] = el
                                                        } else {
                                                            delete videoRefs.current[track._id]
                                                        }
                                                    }}
                                                    src={track.songFile.url} 
                                                    className="track-video"
                                                />
                                                <div className="track-video-overlay position-absolute d-flex align-items-center justify-content-center">
                                                    <Icon 
                                                        icon={isPlaying ? "material-symbols:pause-rounded" : "material-symbols:play-arrow-rounded"} 
                                                        className="track-play-icon"
                                                    />
                                                </div>
                                            </>
                                        ) : (
                                            <Icon 
                                                icon={isPlaying ? "material-symbols:pause-rounded" : "material-symbols:play-arrow-rounded"} 
                                                className="track-play-icon"
                                            />
                                        )}
                                    </div>

                                    {/* Track Info */}
                                    <div className="d-flex flex-column align-items-start justify-content-start flex-grow-1">
                                        <h4 className="mb-1 track-title">{track.songName}</h4>
                                        <p className="mb-0 track-genre">{track.genre}</p>
                                    </div>

                                    {/* Status Badge on the max right */}
                                    <div className="d-flex align-items-center justify-content-end">
                                        <span className={`badge bg-${getStatusColor(track.status)}`}>
                                            {track.status}
                                        </span>
                                    </div>

                                    {/* Hidden Audio Element for Audio Tracks */}
                                    {track.songFile?.resource_type === 'audio' && (
                                        <audio
                                            ref={(el) => {
                                                if (el) {
                                                    audioRefs.current[track._id] = el
                                                } else {
                                                    delete audioRefs.current[track._id]
                                                }
                                            }}
                                            src={track.songFile.url}
                                            onEnded={() => {
                                                if (playingTrack === track._id) {
                                                    setPlayingTrack(null)
                                                }
                                            }}
                                            onError={() => {
                                                toast.error('Error playing audio')
                                                if (playingTrack === track._id) {
                                                    setPlayingTrack(null)
                                                }
                                            }}
                                            className="track-audio"
                                        />
                                    )}
                                </div>
                            )
                            })}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    )
}

export default Profile