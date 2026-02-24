import React from 'react';
import { HistoryItem } from '../types';
import { motion } from 'framer-motion';

interface HistoryPanelProps {
    history: HistoryItem[];
    onClear: () => void;
    isOpen: boolean;
    onClose: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onClear, isOpen, onClose }) => {
    return (
        <>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]"
                onClick={onClose}
            />

            {/* Panel */}
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 h-full w-full max-w-sm bg-gradient-to-b from-[#4a0808] to-[#2a0505] border-l border-yellow-500/30 z-[120] shadow-2xl"
            >
                <div className="flex flex-col h-full p-6 text-yellow-100">
                    <div className="flex justify-between items-center mb-8 border-b border-yellow-500/20 pb-4">
                        <h2 className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500">
                            歷史紀錄
                        </h2>
                        <button onClick={onClose} className="text-yellow-500/50 hover:text-yellow-400 transition-colors">
                            ✕
                        </button>
                    </div>

                    <div className="flex-grow overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                        {history.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full opacity-40">
                                <span className="text-4xl mb-2">📜</span>
                                <p>尚無發財紀錄</p>
                            </div>
                        ) : (
                            history.map((item) => (
                                <div key={item.id} className="bg-red-950/40 border border-yellow-500/10 rounded-xl p-4 shadow-inner">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-sm font-bold text-yellow-500/80">{item.gameName}</span>
                                        <span className="text-[10px] opacity-40 font-mono text-right">
                                            {new Date(item.timestamp).toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })} {new Date(item.timestamp).toLocaleTimeString('zh-TW', { hour12: false, hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {item.zoneA.map((n, i) => (
                                            <span key={i} className="w-8 h-8 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-xs font-bold">
                                                {String(n).padStart(2, '0')}
                                            </span>
                                        ))}
                                        {item.zoneB && item.zoneB.map((n, i) => (
                                            <span key={i} className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center text-xs font-bold text-red-200">
                                                {String(n).padStart(2, '0')}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="mt-8 pt-4 border-t border-yellow-500/20">
                        <button
                            onClick={onClear}
                            disabled={history.length === 0}
                            className="w-full py-3 rounded-xl border border-red-500/50 text-red-400 text-sm font-bold hover:bg-red-500/10 transition-all disabled:opacity-30"
                        >
                            🗑 清除所有紀錄
                        </button>
                    </div>
                </div>
            </motion.div>
        </>
    );
};
