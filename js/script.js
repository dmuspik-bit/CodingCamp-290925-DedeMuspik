// Validasi form: input dan tanggal harus diisi

document.addEventListener('DOMContentLoaded', function() {
	const form = document.getElementById('todo-form');
	const todoInput = document.getElementById('todo-input');
	const dateInput = document.getElementById('date-input');

	const tableBody = document.querySelector('#task-table tbody');
	const tableWrapper = document.getElementById('task-table-wrapper');
	const totalTasksEl = document.getElementById('total-tasks');
	const completedTasksEl = document.getElementById('completed-tasks');
	const pendingTasksEl = document.getElementById('pending-tasks');
	const progressPercentEl = document.getElementById('progress-percent');
	const filterSelect = document.getElementById('filter-select');
	const deleteAllBtn = document.getElementById('delete-all-btn');
	let tasks = [];
	let currentFilter = 'all';
	// Event tombol Delete All
	deleteAllBtn.addEventListener('click', function() {
		Swal.fire({
			title: 'Apakah kamu yakin ingin menghapus semua tugas?',
			text: 'Tindakan ini tidak dapat dibatalkan!',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#e74c3c',
			cancelButtonColor: '#3498db',
			confirmButtonText: 'Ya, hapus!',
			cancelButtonText: 'Tidak',
		}).then((result) => {
			if (result.isConfirmed) {
				tasks = [];
				renderTable();
				updateSummary();
				Swal.fire({
					icon: 'success',
					title: 'Berhasil!',
					text: 'Semua tugas berhasil dihapus.',
					confirmButtonColor: '#3498db',
					timer: 1200,
					showConfirmButton: false
				});
			}
			// Jika tidak, tidak terjadi apa-apa
		});
	});

	form.addEventListener('submit', function(e) {
		e.preventDefault();
		// Validasi wajib isi
		if (!todoInput.value.trim() || !dateInput.value) {
			Swal.fire({
				icon: 'error',
				title: 'Oops...',
				text: 'Silakan isi nama tugas dan tanggal!',
				confirmButtonColor: '#3498db'
			});
			return false;
		}

		// Cek duplikasi (opsional, bisa dihapus jika tidak ingin validasi ini)
		 const isDuplicate = tasks.some(t => t.name === todoInput.value.trim() && t.date === dateInput.value);
		 if (isDuplicate) {
		     Swal.fire({
		         icon: 'warning',
		         title: 'Tugas sudah ada!',
		         text: 'Tugas dengan nama dan tanggal yang sama sudah ada.',
		         confirmButtonColor: '#3498db'
		    });
		    return false;
		 }

		// Simpan data ke array
		tasks.push({
			name: todoInput.value.trim(),
			date: dateInput.value,
			completed: false
		});
	renderTable();
		updateSummary();
		Swal.fire({
			icon: 'success',
			title: 'Berhasil!',
			text: 'Tugas berhasil ditambahkan.',
			confirmButtonColor: '#3498db',
			timer: 1200,
			showConfirmButton: false
		});
		form.reset();
	});

	function renderTable() {
		tableBody.innerHTML = '';
		let filteredTasks = tasks;
		if (currentFilter === 'pending') {
			filteredTasks = tasks.filter(t => !t.completed);
		} else if (currentFilter === 'completed') {
			filteredTasks = tasks.filter(t => t.completed);
		}
		// Filter tanggal
		const dateStart = document.getElementById('filter-date-start').value;
		const dateEnd = document.getElementById('filter-date-end').value;
		if (dateStart) {
			filteredTasks = filteredTasks.filter(t => t.date >= dateStart);
		}
		if (dateEnd) {
			filteredTasks = filteredTasks.filter(t => t.date <= dateEnd);
		}
		// Tampilkan/hide tabel sesuai data
		if (tasks.length === 0) {
			tableWrapper.style.display = 'none';
		} else {
			tableWrapper.style.display = '';
		}
		filteredTasks.forEach((task, idx) => {
			const realIdx = tasks.indexOf(task);
			const tr = document.createElement('tr');
			tr.innerHTML = `
				<td>${idx + 1}</td>
				<td${task.completed ? ' style="text-decoration:line-through;color:#7f8c8d"' : ''}>${task.name}</td>
				<td>${task.date}</td>
				<td style="text-align:center;">
					<button class="toggle-status-btn" data-idx="${realIdx}" title="Ubah Status" style="background:none;border:none;cursor:pointer;">
						<i class="fas fa-check-circle" style="color:${task.completed ? '#27ae60' : '#b2bec3'};font-size:1.3em;"></i>
					</button>
					<span style="margin-left:6px;font-weight:bold;${task.completed ? 'color:#27ae60' : 'color:#e67e22'}">${task.completed ? 'Selesai' : 'Tunda'}</span>
				</td>
				<td style="text-align:center;">
					<button class="edit-btn" data-idx="${realIdx}" title="Edit"><i class="fas fa-edit"></i></button>
					<button class="delete-btn" data-idx="${realIdx}" title="Hapus"><i class="fas fa-trash"></i></button>
				</td>
			`;
			tableBody.appendChild(tr);
		});

		// Event untuk toggle status (ceklis)
		document.querySelectorAll('.toggle-status-btn').forEach(btn => {
			btn.addEventListener('click', function() {
				const idx = this.getAttribute('data-idx');
				tasks[idx].completed = !tasks[idx].completed;
				renderTable();
				updateSummary();
			});
		});

		// Event untuk tombol edit
		document.querySelectorAll('.edit-btn').forEach(btn => {
			btn.addEventListener('click', function() {
				const idx = this.getAttribute('data-idx');
				const task = tasks[idx];
				todoInput.value = task.name;
				dateInput.value = task.date;
				// Hapus task lama, user submit untuk update
				tasks.splice(idx, 1);
				renderTable();
				updateSummary();
			});
		});

		// Event untuk tombol delete
		document.querySelectorAll('.delete-btn').forEach(btn => {
			btn.addEventListener('click', function() {
				const idx = this.getAttribute('data-idx');
				Swal.fire({
					title: 'Hapus tugas ini?',
					text: 'Tindakan ini tidak dapat dibatalkan!',
					icon: 'warning',
					showCancelButton: true,
					confirmButtonColor: '#e74c3c',
					cancelButtonColor: '#3498db',
					confirmButtonText: 'Ya, hapus!',
					cancelButtonText: 'Tidak',
				}).then((result) => {
					if (result.isConfirmed) {
						tasks.splice(idx, 1);
						renderTable();
						updateSummary();
						Swal.fire({
							icon: 'success',
							title: 'Berhasil!',
							text: 'Tugas berhasil dihapus.',
							confirmButtonColor: '#3498db',
							timer: 1200,
							showConfirmButton: false
						});
					}
				});
			});
		});
	}
	// Tombol Filter dan Reset Status
	const filterStatusBtn = document.getElementById('filter-status-btn');
	const resetStatusBtn = document.getElementById('reset-status-btn');
	filterStatusBtn.addEventListener('click', function() {
		currentFilter = filterSelect.value;
		renderTable();
	});
	resetStatusBtn.addEventListener('click', function() {
		filterSelect.value = 'all';
		currentFilter = 'all';
		renderTable();
	});

	// Tombol Filter dan Reset Tanggal
	const filterDateBtn = document.getElementById('filter-date-btn');
	const resetDateBtn = document.getElementById('reset-date-btn');
	const filterDateStart = document.getElementById('filter-date-start');
	const filterDateEnd = document.getElementById('filter-date-end');
	filterDateBtn.addEventListener('click', function() {
		renderTable();
	});
	resetDateBtn.addEventListener('click', function() {
		filterDateStart.value = '';
		filterDateEnd.value = '';
		renderTable();
	});

	function updateSummary() {
		const total = tasks.length;
		const completed = tasks.filter(t => t.completed).length;
		const pending = total - completed;
		const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
		totalTasksEl.textContent = total;
		completedTasksEl.textContent = completed;
		pendingTasksEl.textContent = pending;
		progressPercentEl.textContent = progress + '%';
	}

	// Inisialisasi summary saat load
	updateSummary();
});
