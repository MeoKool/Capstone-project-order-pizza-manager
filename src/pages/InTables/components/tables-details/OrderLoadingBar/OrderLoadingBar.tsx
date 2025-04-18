import * as React from 'react'
import { motion } from 'framer-motion'
import { Pizza } from 'lucide-react'

interface CustomOrderLoadingProps {
    message?: string

}

const OrderProgress: React.FC<CustomOrderLoadingProps> = ({
    message = 'Đang tải đơn hàng...',

}) => {

    return (
        <div className="bg-white h-[350px] to-white flex flex-col items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                    duration: 0.5,
                    ease: [0, 0.71, 0.2, 1.01],
                    scale: {
                        type: 'spring',
                        damping: 5,
                        stiffness: 100,
                        restDelta: 0.001,
                    },
                }}
            >
                <div className="relative">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                            duration: 2,
                            ease: 'linear',
                            repeat: Infinity,
                        }}
                        className="text-orange-500"
                    >
                        <Pizza size={34} />
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="absolute inset-0 flex items-center justify-center"
                    >

                    </motion.div>
                </div>
            </motion.div>

            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mt-3 text-sm font-semibold text-orange-600 text-center"
            >
                {message}
            </motion.h2>
        </div>
    )
}

export default OrderProgress
