import React, { useState, useEffect, useCallback } from 'react'
import { X, ChevronRight, ChevronLeft, CheckCircle2, Sparkles } from 'lucide-react'
import './OnboardingModal.css'
const TOUR_STEPS = [
    {
        selector: '.sidebar-nav-list .sidebar-nav-item:nth-of-type(2), .navbar-links .dropdown-toggle',
        title: '1. Eksplorasi Modul POE',
        description:
            'Klik menu Modul POE untuk mempelajari 3 faktor laju reaksi (Konsentrasi, Luas Permukaan, Suhu & Katalis) dengan tahapan Predict – Observe – Explain serta simulasi tumbukan partikel.',
        preferredPlacement: 'right'
    },
    {
        selector: '.sidebar-nav-list .sidebar-nav-item:nth-of-type(3), .nav-btn-kuis',
        title: '2. Kuis Interaktif & Diagnostik',
        description:
            'Uji pemahamanmu di menu Kuis Interaktif setelah mencoba simulasi. Sistem akan mengevaluasi penguasaan konsep sekaligus mendeteksi miskonsepsi.',
        preferredPlacement: 'right'
    },
    {
        selector: '.sidebar-progress-card, .progress-pill',
        title: '3. Pantau Progres Belajarmu',
        description:
            'Setiap modul dan kuis yang berhasil diselesaikan akan tercatat otomatis di kartu Progres Modul ini sehingga kamu tahu sejauh mana pencapaianmu.',
        preferredPlacement: 'right'
    },
    {
        selector: '.navbar-search-btn, .sidebar-nav-list .sidebar-nav-item:last-of-type',
        title: '4. Pencarian Cepat & Pustaka',
        description:
            'Gunakan fitur pencarian cepat atau menu Referensi & Pustaka untuk menemukan istilah kinetika kimia, rumus laju reaksi, dan sumber belajar pendukung.',
        preferredPlacement: 'bottom'
    },
    {
        selector: '.btn-reopen-onboarding',
        title: '5. Buka Ulang Panduan Kapan Saja',
        description:
            'Panduan ini hanya muncul otomatis 1 kali saat akun pertama kali masuk. Jika suatu saat butuh bantuan lagi, cukup klik tombol di bagian paling bawah halaman ini.',
        preferredPlacement: 'top'
    }
]

function findVisibleElement(selectorString) {
    if (!selectorString) return null
    const selectors = selectorString.split(',').map((s) => s.trim())
    for (const sel of selectors) {
        const elements = document.querySelectorAll(sel)
        for (const el of elements) {
            const rect = el.getBoundingClientRect()
            if (rect.width > 0 && rect.height > 0) {
                return el
            }
        }
    }
    return null
}

export default function OnboardingModal({ isOpen, onClose }) {
    const [currentStep, setCurrentStep] = useState(0)
    const [targetRect, setTargetRect] = useState(null)

    const updateSpotlightPosition = useCallback(() => {
        if (!isOpen) return
        const step = TOUR_STEPS[currentStep]
        const targetEl = findVisibleElement(step?.selector)

        if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
            // Beri jeda singkat agar koordinat akurat setelah scroll selesai
            const rect = targetEl.getBoundingClientRect()
            const padding = 6
            setTargetRect({
                top: Math.max(4, rect.top - padding),
                left: Math.max(4, rect.left - padding),
                width: rect.width + padding * 2,
                height: rect.height + padding * 2
            })
        } else {
            setTargetRect(null)
        }
    }, [isOpen, currentStep])

    useEffect(() => {
        if (isOpen) {
            setCurrentStep(0)
        }
    }, [isOpen])

    useEffect(() => {
        if (!isOpen) return
        updateSpotlightPosition()
        const timer = setTimeout(updateSpotlightPosition, 260)
        window.addEventListener('resize', updateSpotlightPosition)
        window.addEventListener('scroll', updateSpotlightPosition, true)
        return () => {
            clearTimeout(timer)
            window.removeEventListener('resize', updateSpotlightPosition)
            window.removeEventListener('scroll', updateSpotlightPosition, true)
        }
    }, [isOpen, currentStep, updateSpotlightPosition])

    if (!isOpen) return null

    const stepData = TOUR_STEPS[currentStep]
    const isFirstStep = currentStep === 0
    const isLastStep = currentStep === TOUR_STEPS.length - 1

    const handleNext = () => {
        if (isLastStep) {
            onClose()
        } else {
            setCurrentStep((prev) => prev + 1)
        }
    }

    const handlePrev = () => {
        if (!isFirstStep) {
            setCurrentStep((prev) => prev - 1)
        }
    }

    // Hitung posisi kartu tooltip & arah panah agar tidak terpotong tepi layar
    const getTooltipStyleAndArrow = () => {
        if (!targetRect) {
            return {
                style: {
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                },
                arrowClass: 'none'
            }
        }

        const viewportW = window.innerWidth
        const viewportH = window.innerHeight
        const cardWidth = Math.min(340, viewportW - 32)
        const estimatedCardHeight = 225
        const gap = 14

        // 1. Jika di layar desktop dan ada ruang cukup di kanan elemen (misal Sidebar)
        if (
            viewportW >= 768 &&
            stepData.preferredPlacement === 'right' &&
            targetRect.left + targetRect.width + cardWidth + gap + 16 < viewportW
        ) {
            const topPos = Math.min(
                Math.max(16, targetRect.top - 10),
                viewportH - estimatedCardHeight - 16
            )
            return {
                style: {
                    top: `${topPos}px`,
                    left: `${targetRect.left + targetRect.width + gap}px`,
                    width: `${cardWidth}px`
                },
                arrowClass: 'arrow-left'
            }
        }

        // 2. Jika elemen berada di bawah layar (misal tombol footer) -> taruh tooltip di atasnya
        if (
            stepData.preferredPlacement === 'top' ||
            targetRect.top + targetRect.height + estimatedCardHeight + gap > viewportH
        ) {
            const leftPos = Math.min(
                Math.max(16, targetRect.left + targetRect.width / 2 - cardWidth / 2),
                viewportW - cardWidth - 16
            )
            return {
                style: {
                    bottom: `${Math.max(16, viewportH - targetRect.top + gap)}px`,
                    left: `${leftPos}px`,
                    width: `${cardWidth}px`
                },
                arrowClass: 'arrow-bottom'
            }
        }

        // 3. Default: taruh tooltip tepat di bawah elemen dengan panah menunjuk ke atas
        const leftPos = Math.min(
            Math.max(16, targetRect.left + targetRect.width / 2 - cardWidth / 2),
            viewportW - cardWidth - 16
        )
        return {
            style: {
                top: `${targetRect.top + targetRect.height + gap}px`,
                left: `${leftPos}px`,
                width: `${cardWidth}px`
            },
            arrowClass: 'arrow-top'
        }
    }

    const { style: tooltipStyle, arrowClass } = getTooltipStyleAndArrow()

    return (
        <div
            className="spotlight-tour-layer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="spotlight-tour-title"
        >
            {/* Backdrop gelap penuh jika elemen tidak ditemukan */}
            {!targetRect && <div className="spotlight-fallback-backdrop" onClick={onClose} />}

            {/* Kotak Sorotan Terang (Spotlight Cutout) */}
            {targetRect && (
                <div
                    className="spotlight-focus-box"
                    style={{
                        top: `${targetRect.top}px`,
                        left: `${targetRect.left}px`,
                        width: `${targetRect.width}px`,
                        height: `${targetRect.height}px`
                    }}
                />
            )}

            {/* Kotak Tooltip Petunjuk dengan Panah */}
            <div className={`spotlight-tooltip-card ${arrowClass}`} style={tooltipStyle}>
                <div className="spotlight-tooltip-header">
                    <span className="spotlight-step-pill">
                        <Sparkles size={12} />
                        <span>
                            Panduan {currentStep + 1}/{TOUR_STEPS.length}
                        </span>
                    </span>
                    <button
                        type="button"
                        className="spotlight-close-btn"
                        onClick={onClose}
                        title="Tutup panduan"
                        aria-label="Tutup panduan"
                    >
                        <X size={15} />
                    </button>
                </div>

                <h3 id="spotlight-tour-title" className="spotlight-tooltip-title">
                    {stepData.title}
                </h3>

                <p className="spotlight-tooltip-desc">{stepData.description}</p>

                <div className="spotlight-tooltip-footer">
                    <button type="button" className="spotlight-skip-btn" onClick={onClose}>
                        Lewati
                    </button>

                    <div className="spotlight-btn-group">
                        {!isFirstStep && (
                            <button type="button" className="spotlight-prev-btn" onClick={handlePrev}>
                                <ChevronLeft size={14} />
                                <span>Kembali</span>
                            </button>
                        )}
                        <button type="button" className="spotlight-next-btn" onClick={handleNext}>
                            {isLastStep ? (
                                <>
                                    <CheckCircle2 size={14} />
                                    <span>Selesai</span>
                                </>
                            ) : (
                                <>
                                    <span>Next</span>
                                    <ChevronRight size={14} />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}