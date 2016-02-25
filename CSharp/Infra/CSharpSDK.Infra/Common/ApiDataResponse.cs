using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Lucca.CSharpSDK.Infra.Common
{
	public class ApiDataResponse<TEntity>
	{
		public IEnumerable<TEntity> Items { get; set; }
	}
}
