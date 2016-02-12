using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Lucca.CSharpSDK.Infra
{
	public class ApiResponse<TEntity>
	{
		//Http 200
		public IEnumerable<TEntity> Data { get; set; }

		//Http Error
		public int Status { get; set; }
		public string Message { get; set; }
		public string StackTrace { get; set; }
	}
}
