import React, { useState, useEffect, useCallback, useRef } from 'react'
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
        title: '2. Kuis Interaktif & Evaluasi',
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
    const previousActiveElementRef = useRef(null)
    const modalCardRef = useRef(null)

    const updateSpotlightPosition = useCallback(() => {
        if (!isOpen) return
        const step = TOUR_STEPS[currentStep]
        const targetEl = findVisibleElement(step?.selector)

        if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
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

    // Pengelolaan fokus: simpan elemen fokus sebelumnya dan kembalikan saat ditutup (Temuan 03-10)
    useEffect(() => {
        if (isOpen) {
            previousActiveElementRef.current = document.activeElement
            setCurrentStep(0)
            const focusTimer = setTimeout(() => {
                if (modalCardRef.current) {
                    const firstFocusable = modalCardRef.current.querySelector(
                        'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
                    )
                    if (firstFocusable) {
                        firstFocusable.focus()
                    } else {
                        modalCardRef.current.focus()
                    }
                }
            }, 60)
            return () => clearTimeout(focusTimer)
        } else if (previousActiveElementRef.current && typeof previousActiveElementRef.current.focus === 'function') {
            previousActiveElementRef.current.focus()
        }
    }, [isOpen])

    // Keyboard event listener: Escape untuk menutup dan Tab focus trap (Temuan 03-10)
    useEffect(() => {
        if (!isOpen) return

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault()
                onClose()
                return
            }

            if (e.key === 'Tab') {
                const card = modalCardRef.current
                if (!card) return
                const focusable = card.querySelectorAll(
                    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
                )
                if (focusable.length === 0) return

                const first = focusable[0]
                const last = focusable[focusable.length - 1]

                if (e.shiftKey && document.activeElement === first) {
                    last.focus()
                    e.preventDefault()
                } else if (!e.shiftKey && document.activeElement === last) {
                    first.focus()
                    e.preventDefault()
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose])

    // Otomatis buka sidebar pada layar HP (< 768px) saat menyorot menu sidebar (Temuan 03-10)
    useEffect(() => {
        if (!isOpen) {
            document.querySelector('.app-sidebar')?.classList.remove('tour-mobile-open')
            document.body.classList.remove('tour-mobile-sidebar-open')
            return
        }

        const step = TOUR_STEPS[currentStep]
        const isSidebarStep = Boolean(step?.selector?.includes('.sidebar'))
        const isMobile = window.innerWidth < 768
        const sidebarEl = document.querySelector('.app-sidebar')

        if (isMobile && isSidebarStep && sidebarEl) {
            sidebarEl.classList.add('tour-mobile-open')
            document.body.classList.add('tour-mobile-sidebar-open')
        } else if (sidebarEl) {
            sidebarEl.classList.remove('tour-mobile-open')
            document.body.classList.remove('tour-mobile-sidebar-open')
        }

        const timer = setTimeout(updateSpotlightPosition, 160)

        return () => {
            clearTimeout(timer)
            document.querySelector('.app-sidebar')?.classList.remove('tour-mobile-open')
            document.body.classList.remove('tour-mobile-sidebar-open')
        }
    }, [isOpen, currentStep, updateSpotlightPosition])

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

    // Hitung posisi kartu tooltip & panah rapi dan aman dari tepi layar (Temuan 03-10)
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
        const isMobile = viewportW < 768
        const cardWidth = Math.min(330, viewportW - 24)
        const estimatedCardHeight = 225
        const gap = 12

        // 1. Desktop: Ruang cukup di kanan elemen (misal Sidebar)
        if (
            !isMobile &&
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

        // Hitung posisi horizontal yang selalu aman dari tepi layar
        const leftPos = Math.max(
            12,
            Math.min(viewportW - cardWidth - 12, targetRect.left + (targetRect.width - cardWidth) / 2)
        )

        // 2. Elemen di bagian bawah layar atau preferredPlacement top -> tampil di atas elemen
        if (
            stepData.preferredPlacement === 'top' ||
            targetRect.top + targetRect.height + estimatedCardHeight + gap > viewportH
        ) {
            const bottomPos = Math.max(12, viewportH - targetRect.top + gap)
            return {
                style: {
                    bottom: `${bottomPos}px`,
                    left: `${leftPos}px`,
                    width: `${cardWidth}px`
                },
                arrowClass: 'arrow-bottom'
            }
        }

        // 3. Tampil di bawah elemen
        const topPos = Math.max(
            12,
            Math.min(viewportH - estimatedCardHeight - 12, targetRect.top + targetRect.height + gap)
        )
        return {
            style: {
                top: `${topPos}px`,
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
            {/* Backdrop gelap */}
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
            <div
                ref={modalCardRef}
                tabIndex={-1}
                className={`spotlight-tooltip-card ${arrowClass}`}
                style={tooltipStyle}
            >
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
                        title="Tutup panduan (Esc)"
                        aria-label="Tutup panduan (Esc)"
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