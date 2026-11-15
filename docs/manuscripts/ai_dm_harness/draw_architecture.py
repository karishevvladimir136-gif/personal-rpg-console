"""Draw a conceptual responsibility loop, not a service deployment diagram."""
from pathlib import Path
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch

ROOT=Path(__file__).resolve().parent
plt.rcParams.update({'font.family':'DejaVu Sans','svg.fonttype':'none'})
fig,ax=plt.subplots(figsize=(7,3.45))
fig.subplots_adjust(left=.01,right=.99,bottom=.02,top=.99)
ax.set_xlim(0,7.5);ax.set_ylim(0,3.7);ax.axis('off')
color='#29495B'
def box(x,y,title,detail):
    ax.add_patch(FancyBboxPatch((x-1.08,y-.46),2.16,.92,boxstyle='round,pad=0.04,rounding_size=.08',edgecolor=color,facecolor='#F2F6F8',lw=1.2))
    ax.text(x,y+.17,title,ha='center',va='center',fontsize=10.4,fontweight='bold',color='#152B38')
    ax.text(x,y-.16,detail,ha='center',va='center',fontsize=9.1,linespacing=1.4,color='#26333B')
def arrow(a,b):
    ax.add_patch(FancyArrowPatch(a,b,arrowstyle='-|>',mutation_scale=12,lw=1.3,color=color))
box(1.2,2.85,'Player proposal','Purpose, plan,\nterms of an attempt')
box(3.75,2.85,'AI DM interpretation','Situation, rules,\ncharacter responses')
box(6.3,2.85,'Application controls','Supported checks,\ncards and resources')
box(6.3,.85,'Continuing world','Structured records\nand narrative history')
box(1.2,.85,'Player observations','Screens and information\navailable to each seat')
arrow((2.35,2.85),(2.59,2.85));arrow((4.9,2.85),(5.15,2.85))
arrow((6.3,2.33),(6.3,1.37));arrow((5.15,.85),(2.35,.85));arrow((1.2,1.37),(1.2,2.33))
ax.text(3.75,.98,'Consequences inform the next choice',ha='center',va='bottom',fontsize=9,color=color)
ax.text(3.75,1.73,'Proposals can succeed, be revised,\nbe refused, or remain blocked.',ha='center',va='center',fontsize=10,linespacing=1.5,color='#364751')
for suffix in ['png','svg']:
    fig.savefig(ROOT/'assets'/('action_loop.'+suffix),dpi=240,facecolor='white')
print('Architecture figure created')
