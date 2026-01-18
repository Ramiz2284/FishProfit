import { useEffect, useState } from 'react'

// Локальное хранилище
const STORAGE_KEY = 'fish_batches_v1'

function loadBatches() {
	try {
		return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
	} catch {
		return []
	}
}

function saveBatches(batches) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(batches))
}

function calcBatch(batch) {
	// Выручка: либо из продаж, либо по старой формуле
	let revenue
	if (batch.sales && batch.sales.length > 0) {
		revenue = batch.sales.reduce((sum, sale) => sum + sale.totalPrice, 0)
	} else {
		revenue = batch.outputKg * batch.pricePerKg * (1 - batch.discount)
	}

	const variableCosts =
		batch.electricity + batch.water + batch.fuel + batch.packaging
	const profit = revenue - batch.purchaseCost - variableCosts
	const margin = revenue > 0 ? profit / revenue : 0

	// минимальная цена для целевой маржи
	const costBase = batch.purchaseCost + variableCosts
	const minPriceForMargin = targetMargin => {
		if (batch.outputKg <= 0) return 0
		return costBase / (batch.outputKg * (1 - targetMargin))
	}

	return { revenue, profit, margin, minPriceForMargin }
}

export default function App() {
	const [batches, setBatches] = useState(loadBatches())
	const [monthlyCosts, setMonthlyCosts] = useState({
		rent: 0,
		ads: 0,
		other: 0,
	})
	const [view, setView] = useState('batches')

	useEffect(() => {
		saveBatches(batches)
	}, [batches])

	const addBatch = () => {
		setBatches([
			...batches,
			{
				id: crypto.randomUUID(),
				date: new Date().toISOString().slice(0, 10),
				purchaseCost: 0,
				outputKg: 0,
				pricePerKg: 0,
				discount: 0,
				electricity: 0,
				water: 0,
				fuel: 0,
				packaging: 0,
				sales: [],
			},
		])
	}

	const updateBatch = (id, field, value) => {
		setBatches(
			batches.map(b =>
				b.id === id ? { ...b, [field]: Number(value) || value } : b
			)
		)
	}

	const removeBatch = id => {
		setBatches(batches.filter(b => b.id !== id))
	}

	const addSale = (batchId, gramsAmount, totalPrice) => {
		setBatches(
			batches.map(b =>
				b.id === batchId
					? {
							...b,
							sales: [
								...(b.sales || []),
								{
									id: crypto.randomUUID(),
									gramsAmount: Number(gramsAmount),
									totalPrice: Number(totalPrice),
									dateTime: new Date().toISOString(),
								},
							],
					  }
					: b
			)
		)
	}

	const removeSale = (batchId, saleId) => {
		setBatches(
			batches.map(b =>
				b.id === batchId
					? { ...b, sales: b.sales.filter(s => s.id !== saleId) }
					: b
			)
		)
	}

	const totalProfit = batches.reduce((sum, b) => sum + calcBatch(b).profit, 0)
	const чистаяПрибыль =
		totalProfit - monthlyCosts.rent - monthlyCosts.ads - monthlyCosts.other

	return (
		<div className='min-h-screen bg-gradient-to-b from-slate-50 to-white'>
			<div className='p-3 sm:p-4 max-w-4xl mx-auto'>
				<h1 className='text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center text-slate-900'>
					🐟 Fish Profit
				</h1>

				<div className='flex gap-2 mb-4 sm:mb-6 sticky top-0 bg-white/95 py-2 -mx-3 sm:-mx-4 px-3 sm:px-4 z-10'>
					<button
						onClick={() => setView('batches')}
						className={`flex-1 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-medium transition ${
							view === 'batches'
								? 'bg-blue-600 text-white shadow'
								: 'border border-slate-300 text-slate-700 hover:bg-slate-50'
						}`}
					>
						Партии
					</button>
					<button
						onClick={() => setView('sales')}
						className={`flex-1 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-medium transition ${
							view === 'sales'
								? 'bg-blue-600 text-white shadow'
								: 'border border-slate-300 text-slate-700 hover:bg-slate-50'
						}`}
					>
						Продажи
					</button>
					<button
						onClick={() => setView('month')}
						className={`flex-1 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-medium transition ${
							view === 'month'
								? 'bg-blue-600 text-white shadow'
								: 'border border-slate-300 text-slate-700 hover:bg-slate-50'
						}`}
					>
						Месяц
					</button>
				</div>

				{view === 'batches' && (
					<>
						<button
							onClick={addBatch}
							className='w-full mb-4 px-4 py-3 sm:py-4 rounded-lg sm:rounded-xl shadow bg-blue-600 text-white font-medium text-base sm:text-lg hover:bg-blue-700 transition'
						>
							+ Добавить партию
						</button>

						<div className='space-y-3 sm:space-y-4'>
							{batches.map(b => {
								const { revenue, profit, margin } = calcBatch(b)
								return (
									<div
										key={b.id}
										className='border border-slate-200 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm space-y-3 bg-white hover:shadow-md transition'
									>
										<div className='flex justify-between items-center gap-2'>
											<input
												type='date'
												value={b.date}
												onChange={e =>
													updateBatch(b.id, 'date', e.target.value)
												}
												className='border border-slate-300 rounded-lg p-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500'
											/>
											<button
												onClick={() => removeBatch(b.id)}
												className='text-red-500 text-2xl hover:bg-red-50 rounded-lg p-1 transition'
												title='Удалить'
											>
												✕
											</button>
										</div>

										<div className='grid grid-cols-2 gap-2 sm:gap-3'>
											<div>
												<label className='text-xs font-medium text-slate-600'>
													Закупка, лир
												</label>
												<input
													type='number'
													value={b.purchaseCost}
													onChange={e =>
														updateBatch(b.id, 'purchaseCost', e.target.value)
													}
													className='border border-slate-300 rounded-lg p-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
												/>
											</div>
											<div>
												<label className='text-xs font-medium text-slate-600'>
													Выход, кг
												</label>
												<input
													type='number'
													value={b.outputKg}
													onChange={e =>
														updateBatch(b.id, 'outputKg', e.target.value)
													}
													className='border border-slate-300 rounded-lg p-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
												/>
											</div>
											<div>
												<label className='text-xs font-medium text-slate-600'>
													Цена, лир/кг
												</label>
												<input
													type='number'
													value={b.pricePerKg}
													onChange={e =>
														updateBatch(b.id, 'pricePerKg', e.target.value)
													}
													className='border border-slate-300 rounded-lg p-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
												/>
											</div>
											<div>
												<label className='text-xs font-medium text-slate-600'>
													Скидка, %
												</label>
												<input
													type='number'
													value={b.discount * 100}
													onChange={e =>
														updateBatch(b.id, 'discount', e.target.value / 100)
													}
													className='border border-slate-300 rounded-lg p-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
												/>
											</div>
										</div>

										<div className='grid grid-cols-2 gap-2 sm:gap-3 pt-2 border-t border-slate-200'>
											<div>
												<label className='text-xs font-medium text-slate-600'>
													Электричество, лир
												</label>
												<input
													type='number'
													value={b.electricity}
													onChange={e =>
														updateBatch(b.id, 'electricity', e.target.value)
													}
													className='border border-slate-300 rounded-lg p-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
												/>
											</div>
											<div>
												<label className='text-xs font-medium text-slate-600'>
													Вода, лир
												</label>
												<input
													type='number'
													value={b.water}
													onChange={e =>
														updateBatch(b.id, 'water', e.target.value)
													}
													className='border border-slate-300 rounded-lg p-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
												/>
											</div>
											<div>
												<label className='text-xs font-medium text-slate-600'>
													Бензин, лир
												</label>
												<input
													type='number'
													value={b.fuel}
													onChange={e =>
														updateBatch(b.id, 'fuel', e.target.value)
													}
													className='border border-slate-300 rounded-lg p-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
												/>
											</div>
											<div>
												<label className='text-xs font-medium text-slate-600'>
													Упаковка, лир
												</label>
												<input
													type='number'
													value={b.packaging}
													onChange={e =>
														updateBatch(b.id, 'packaging', e.target.value)
													}
													className='border border-slate-300 rounded-lg p-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
												/>
											</div>
										</div>

										<div className='grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-xs sm:text-sm'>
											<div className='bg-blue-50 rounded p-2'>
												<div className='text-slate-600 font-medium'>
													Выручка
												</div>
												<div className='font-bold text-blue-700'>
													{revenue.toFixed(0)}tl
												</div>
											</div>

											<div
												className={`rounded p-2 ${
													profit < 0 ? 'bg-red-50' : 'bg-green-50'
												}`}
											>
												<div className='text-slate-600 font-medium'>
													Прибыль
												</div>
												<div
													className={`font-bold ${
														profit < 0 ? 'text-red-700' : 'text-green-700'
													}`}
												>
													{profit.toFixed(0)}tl
												</div>
											</div>

											<div
												className={`rounded p-2 ${
													margin < 0.3
														? 'bg-red-50'
														: margin < 0.4
														? 'bg-yellow-50'
														: 'bg-green-50'
												}`}
											>
												<div className='text-slate-600 font-medium'>Маржа</div>
												<div
													className={`font-bold ${
														margin < 0.3
															? 'text-red-700'
															: margin < 0.4
															? 'text-yellow-700'
															: 'text-green-700'
													}`}
												>
													{(margin * 100).toFixed(1)}%
												</div>
											</div>
										</div>
									</div>
								)
							})}
						</div>
					</>
				)}

				{view === 'sales' && (
					<div className='space-y-3 sm:space-y-4'>
						{batches.length === 0 ? (
							<div className='text-center text-slate-500 py-8'>
								Нет партий. Сначала добавьте партию на вкладке "Партии"
							</div>
						) : (
							batches.map(b => {
								const { revenue, profit, margin } = calcBatch(b)
								const totalGrams = (b.sales || []).reduce(
									(sum, s) => sum + s.gramsAmount,
									0
								)
								return (
									<div
										key={b.id}
										className='border border-slate-200 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm bg-white space-y-3'
									>
										<div className='flex justify-between items-start gap-2'>
											<div className='flex-1'>
												<div className='text-sm font-medium text-slate-600'>
													Партия от {b.date}
												</div>
												<div className='text-xs text-slate-500'>
													Закупка: {b.purchaseCost}tl | Выход: {b.outputKg}кг
												</div>
											</div>
											<div className='text-right'>
												<div className='text-xs text-slate-600'>
													Реализовано
												</div>
												<div className='font-bold text-blue-700'>
													{totalGrams}г
												</div>
											</div>
										</div>

										{(b.sales || []).length > 0 && (
											<div className='bg-slate-50 rounded p-2 space-y-1'>
												{b.sales.map(sale => (
													<div
														key={sale.id}
														className='flex justify-between items-center gap-2 text-xs'
													>
														<span className='text-slate-600'>
															{sale.gramsAmount}г =
															<span className='font-medium'>
																{sale.totalPrice.toFixed(0)}tl
															</span>
														</span>
														<button
															onClick={() => removeSale(b.id, sale.id)}
															className='text-red-500 hover:bg-red-100 rounded px-1 transition'
															title='Удалить'
														>
															✕
														</button>
													</div>
												))}
											</div>
										)}

										<div className='grid grid-cols-2 gap-2 pt-2 border-t border-slate-200'>
											<input
												type='number'
												placeholder='Граммы'
												id={`grams-${b.id}`}
												className='border border-slate-300 rounded-lg p-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
											/>
											<input
												type='number'
												placeholder='Сумма, лир'
												id={`price-${b.id}`}
												className='border border-slate-300 rounded-lg p-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
											/>
										</div>
										<button
											onClick={() => {
												const gramsInput = document.getElementById(
													`grams-${b.id}`
												)
												const priceInput = document.getElementById(
													`price-${b.id}`
												)
												if (gramsInput.value && priceInput.value) {
													addSale(b.id, gramsInput.value, priceInput.value)
													gramsInput.value = ''
													priceInput.value = ''
												}
											}}
											className='w-full px-3 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition'
										>
											+ Добавить продажу
										</button>

										<div className='grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-xs sm:text-sm'>
											<div className='bg-blue-50 rounded p-2'>
												<div className='text-slate-600 font-medium'>
													Выручка
												</div>
												<div className='font-bold text-blue-700'>
													{revenue.toFixed(0)}tl
												</div>
											</div>
											<div
												className={`rounded p-2 ${
													profit < 0 ? 'bg-red-50' : 'bg-green-50'
												}`}
											>
												<div className='text-slate-600 font-medium'>
													Прибыль
												</div>
												<div
													className={`font-bold ${
														profit < 0 ? 'text-red-700' : 'text-green-700'
													}`}
												>
													{profit.toFixed(0)}tl
												</div>
											</div>
											<div
												className={`rounded p-2 ${
													margin < 0.3
														? 'bg-red-50'
														: margin < 0.4
														? 'bg-yellow-50'
														: 'bg-green-50'
												}`}
											>
												<div className='text-slate-600 font-medium'>Маржа</div>
												<div
													className={`font-bold ${
														margin < 0.3
															? 'text-red-700'
															: margin < 0.4
															? 'text-yellow-700'
															: 'text-green-700'
													}`}
												>
													{(margin * 100).toFixed(1)}%
												</div>
											</div>
										</div>
									</div>
								)
							})
						)}
					</div>
				)}

				{view === 'month' && (
					<div className='space-y-3 sm:space-y-4 max-w-md'>
						<div className='bg-white border border-slate-200 rounded-lg p-3 sm:p-4'>
							<label className='text-xs font-medium text-slate-600'>
								Аренда помещения, лир
							</label>
							<input
								type='number'
								value={monthlyCosts.rent}
								onChange={e =>
									setMonthlyCosts({
										...monthlyCosts,
										rent: Number(e.target.value),
									})
								}
								className='border border-slate-300 rounded-lg p-2 w-full text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500'
							/>
						</div>
						<div className='bg-white border border-slate-200 rounded-lg p-3 sm:p-4'>
							<label className='text-xs font-medium text-slate-600'>
								Реклама, лир
							</label>
							<input
								type='number'
								value={monthlyCosts.ads}
								onChange={e =>
									setMonthlyCosts({
										...monthlyCosts,
										ads: Number(e.target.value),
									})
								}
								className='border border-slate-300 rounded-lg p-2 w-full text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500'
							/>
						</div>
						<div className='bg-white border border-slate-200 rounded-lg p-3 sm:p-4'>
							<label className='text-xs font-medium text-slate-600'>
								Прочие расходы, лир
							</label>
							<input
								type='number'
								value={monthlyCosts.other}
								onChange={e =>
									setMonthlyCosts({
										...monthlyCosts,
										other: Number(e.target.value),
									})
								}
								className='border border-slate-300 rounded-lg p-2 w-full text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500'
							/>
						</div>

						<div className='border-t-2 border-slate-200 pt-4 space-y-2 sm:space-y-3'>
							<div className='flex justify-between items-center bg-blue-50 rounded-lg p-3'>
								<span className='font-medium text-slate-700'>
									Прибыль партий:
								</span>
								<span className='font-bold text-lg text-blue-700'>
									{totalProfit.toFixed(0)}tl
								</span>
							</div>
							<div
								className={`flex justify-between items-center rounded-lg p-3 ${
									чистаяПрибыль < 0 ? 'bg-red-50' : 'bg-green-50'
								}`}
							>
								<span className='font-semibold text-slate-700'>
									Чистая прибыль:
								</span>
								<span
									className={`font-bold text-lg ${
										чистаяПрибыль < 0 ? 'text-red-700' : 'text-green-700'
									}`}
								>
									{чистаяПрибыль.toFixed(0)}tl
								</span>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
