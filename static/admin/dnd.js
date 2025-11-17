// Alpine.js dual-list drag & drop component
// Usage:
// <div x-data="dndLists({
//   listA: itemsA,
//   listB: itemsB,
//   idKey: 'id',
//   onChange: (a,b) => console.log('lists updated', a,b)
// })">
//   <ul x-ref="a" class="dnd-list" x-on:dragover.prevent @drop.prevent="onDrop($event, 'A')">
//     <template x-for="(item, index) in listA" :key="item[idKey]">
//       <li draggable="true" :data-id="item[idKey]" @dragstart="onDragStart($event, 'A', index)" @dragend="onDragEnd" @keydown.space.prevent="onKeyPick($event, 'A', index)" tabindex="0">
//         <span x-text="item.label"></span>
//       </li>
//     </template>
//   </ul>

//   <ul x-ref="b" class="dnd-list" x-on:dragover.prevent @drop.prevent="onDrop($event, 'B')">
//     <template x-for="(item, index) in listB" :key="item[idKey]">
//       <li draggable="true" :data-id="item[idKey]" @dragstart="onDragStart($event, 'B', index)" @dragend="onDragEnd" @keydown.space.prevent="onKeyPick($event, 'B', index)" tabindex="0">
//         <span x-text="item.label"></span>
//       </li>
//     </template>
//   </ul>
// </div>

export function dndLists({ listA = [], listB = [], idKey = 'id', onChange = () => {} } = {}) {
	return {
		listA,
		listB,
		idKey,

		// Drag state
		dragging: null, // { from: 'A'|'B', index, item }
		placeholder: null,

		// Attach dragover listeners to compute precise insertion index
		onDragOver(e, listName) {
			// Determine which LI we are over and whether to place before/after based on mouse Y
			const ul = this.$refs[listName.toLowerCase()];
			if (!ul) return;
			const rect = ul.getBoundingClientRect();
			const children = Array.from(ul.querySelectorAll('li'));
			if (children.length === 0) {
				this.placeholder = { list: listName, index: 0 };
				return;
			}

			let found = false;
			for (let i = 0; i < children.length; i++) {
				const li = children[i];
				const r = li.getBoundingClientRect();
				const mid = r.top + r.height / 2;
				if (e.clientY < mid) {
					this.placeholder = { list: listName, index: i };
					found = true;
					break;
				}
			}
			if (!found) {
				this.placeholder = { list: listName, index: children.length };
			}
		},

		init() {
			// Attach keyboard handlers for accessibility if needed
		},

		findList(name) {
			return name === 'A' ? this.listA : this.listB;
		},

		onDragStart(e, from, index) {
			const list = this.findList(from);
			const item = list[index];
			this.dragging = { from, index, item };
			e.dataTransfer.effectAllowed = 'move';
			try { e.dataTransfer.setData('text/plain', JSON.stringify({ id: item[this.idKey], from })); } catch (err) {}
			// add dragging class
			e.target.classList.add('dragging');
		},

		onDragEnd(e) {
			if (e && e.target) e.target.classList.remove('dragging');
			this.cleanupPlaceholder();
			this.dragging = null;
		},

		onDrop(e, to) {
			if (!this.dragging) return;

			// Remove from source
			const fromList = this.findList(this.dragging.from);
			const [moved] = fromList.splice(this.dragging.index, 1);

			// Use placeholder if present
			let insertIndex = null;
			if (this.placeholder && this.placeholder.list === to) {
				insertIndex = this.placeholder.index;
			}

			const destList = this.findList(to);
			if (insertIndex === null || insertIndex === -1) {
				destList.push(moved);
			} else {
				destList.splice(insertIndex, 0, moved);
			}

			// reset state
			this.onDragEnd(e);

			// Notify
			onChange(this.listA, this.listB);
		},

		cleanupPlaceholder() {
			this.placeholder = null;
		},

		// Basic keyboard pick/drop support
		onKeyPick(e, from, index) {
			// space/enter picks up, next space/enter drops to focused list
			if (!this.dragging) {
				const list = this.findList(from);
				this.dragging = { from, index, item: list[index] };
				// add visual hint maybe
			} else {
				// drop into currently focused element's list at end
				const focused = document.activeElement;
				const ul = focused && focused.closest ? focused.closest('ul') : null;
				const to = ul === this.$refs.b ? 'B' : 'A';
				this.onDrop({ target: focused }, to);
			}
		}
	}
}

// Expose globally for inline usage
if (typeof window !== 'undefined') window.dndLists = dndLists;

