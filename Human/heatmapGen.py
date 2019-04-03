import numpy as np
import numpy.random
import matplotlib.pyplot as plt
from scipy.ndimage.interpolation import zoom

human_data = np.load('./K562_counts.npy')
print(human_data.shape)
hd = zoom(human_data, 0.05)
print(hd.shape)

# Generate some test data
x = np.random.randn(500)
y = np.random.randn(500)

heatmap, xedges, yedges = np.histogram2d(x, y, bins=50)

fig = plt.figure()
fig.set_size_inches((1,1))
ax = plt.Axes(fig, [0., 0., 1., 1.])
ax.set_axis_off()
fig.add_axes(ax)
ax.pcolormesh(hd, edgecolors=None)
print(heatmap.shape)
print(xedges)
print(yedges)
# surf = plt.pcolormesh( heatmap)

# plt.colorbar(surf, shrink=0.75, aspect=5)
plt.savefig('test2.svg', bbox_inches='tight', pad_inches=0,transparent=True)
plt.show()

# Original one
# 
# import numpy as np
# import numpy.random
# import matplotlib.pyplot as plt
# 
# 
# human_data = np.load('./K562_counts.npy')
# print(human_data.shape)
# # Generate some test data
# x = np.random.randn(500)
# y = np.random.randn(500)
# 
# heatmap, xedges, yedges = np.histogram2d(x, y, bins=50)
# 
# 
# print(heatmap.shape)
# print(xedges)
# print(yedges)
# surf = plt.pcolormesh( heatmap)
# 
# plt.colorbar(surf, shrink=0.75, aspect=5)
# plt.savefig('test2.svg')
# plt.show()
# 
